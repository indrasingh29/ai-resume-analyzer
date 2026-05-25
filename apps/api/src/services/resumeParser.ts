import pdfParse from "pdf-parse";
import { ApiError } from "../utils/http";

export async function parseResumePdf(buffer: Buffer) {
  let data: Awaited<ReturnType<typeof pdfParse>>;

  try {
    data = await pdfParse(buffer);
  } catch {
    throw new ApiError(
      422,
      "The PDF could not be parsed. Please upload a readable text-based resume PDF."
    );
  }

  const text = data.text.replace(/\s+/g, " ").trim();

  if (text.length < 120) {
    throw new ApiError(
      422,
      "The PDF was parsed, but it does not contain enough readable resume text."
    );
  }

  return text;
}
