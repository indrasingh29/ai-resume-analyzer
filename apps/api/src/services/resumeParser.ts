import pdfParse from "pdf-parse";
import { ApiError } from "../utils/http";

export async function parseResumePdf(buffer: Buffer) {
  const data = await pdfParse(buffer);
  const text = data.text.replace(/\s+/g, " ").trim();

  if (text.length < 120) {
    throw new ApiError(
      422,
      "The PDF was parsed, but it does not contain enough readable resume text."
    );
  }

  return text;
}
