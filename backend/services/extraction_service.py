import json
import re

from models.schemas import ClientConfig, PageResult
from services.llm_client import LLMClient


def _build_system_prompt(config: ClientConfig) -> str:
    sections_desc = []
    for s in config.sections:
        fields_str = ", ".join(s.fields)
        desc = s.description or s.name
        sections_desc.append(f"- **{s.name}** ({desc}): Expected fields: [{fields_str}]")

    sections_block = "\n".join(sections_desc)

    return f"""You are an expert at extracting structured data from Standard Settlement Instruction (SSI) documents.

{config.prompt}

## Expected Sections and Fields
{sections_block}

## Instructions
1. Extract all information from the provided document page into the sections defined above.
2. For table data, return an array of objects (one per row).
3. For single-value fields, return the value directly.
4. If a field is not found on this page, omit it rather than guessing.
5. Preserve exact values for codes (SWIFT/BIC, IBAN, account numbers) — do not modify them.
6. For each extracted field, provide a confidence score (0-100) indicating how certain you are about the extraction.

## Output Format
Return ONLY valid JSON in this exact structure:
{{
  "sections": {{
    "<section_name>": {{
      "data": <extracted data>,
      "accuracy": {{
        "<field_name>": <confidence_score_0_to_100>
      }}
    }}
  }}
}}"""


def _parse_llm_response(content: str) -> dict:
    cleaned = content.strip()
    # Strip markdown code fences if present
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(1).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"raw_response": content, "parse_error": True}


async def extract_document(
    file_path: str,
    pdf_type: str,
    pages_content: list[str],
    client_config: ClientConfig,
    llm_client: LLMClient,
) -> list[PageResult]:
    system_prompt = _build_system_prompt(client_config)
    results = []

    for i, page_content in enumerate(pages_content):
        if pdf_type == "machine_readable":
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Extract SSI data from this document page (page {i + 1}):\n\n{page_content}"},
            ]
        else:
            messages = [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f"Extract SSI data from this scanned document page (page {i + 1})."},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/png;base64,{page_content}"},
                        },
                    ],
                },
            ]

        response = await llm_client.complete(messages)
        parsed = _parse_llm_response(response.get("content", ""))

        # Separate data and accuracy from sections
        extracted = {}
        accuracy = {}
        sections = parsed.get("sections", parsed)
        if isinstance(sections, dict) and not parsed.get("parse_error"):
            for section_name, section_data in sections.items():
                if isinstance(section_data, dict) and "data" in section_data:
                    extracted[section_name] = section_data["data"]
                    if "accuracy" in section_data:
                        accuracy[section_name] = section_data["accuracy"]
                else:
                    extracted[section_name] = section_data
        else:
            extracted = parsed

        results.append(PageResult(
            page_number=i + 1,
            extracted=extracted,
            accuracy=accuracy if accuracy else None,
        ))

    return results
