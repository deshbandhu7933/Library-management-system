/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Book } from "../types.js";

// Helper: Lazy initialization of the GoogleGenAI client to avoid crashes if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but was not provided.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

interface RecommendedResultItem {
  bookId: number;
  reason: string;
}

/**
 * Calls the Gemini API to get personalized book recommendations for the student
 * based on their past borrowing history and current wishlist.
 */
export async function generateBookRecommendations(
  availableBooks: Book[],
  borrowHistory: { bookTitle: string; bookAuthor: string }[],
  wishlist: { bookTitle: string; bookAuthor: string }[]
): Promise<RecommendedResultItem[]> {
  try {
    // Basic verification
    if (availableBooks.length === 0) {
      return [];
    }

    const ai = getAiClient();

    // Prepare content data for the model
    const catalogData = availableBooks.map(b => ({
      id: b.id,
      title: b.title,
      author: b.authorName,
      category: b.categoryName,
      description: b.description || ""
    }));

    const historyPrompt = borrowHistory.length > 0 
      ? borrowHistory.map(h => `- "${h.bookTitle}" by ${h.bookAuthor}`).join("\n")
      : "No borrowing history yet.";

    const wishlistPrompt = wishlist.length > 0 
      ? wishlist.map(w => `- "${w.bookTitle}" by ${w.bookAuthor}`).join("\n")
      : "No wishlist items yet.";

    const prompt = `
You are an expert librarian assisting a library student with personalized reading recommendations.
We have a total of ${catalogData.length} books in our library catalog.

Here is the student's past borrowing history:
${historyPrompt}

Here is the student's current wishlist of books they are interested in:
${wishlistPrompt}

Your task is to recommend exactly 3 books from our available library catalog that best match this student's interest and reading profile.
If the student has no history or wishlist yet, recommend 3 diverse and highly popular starting books from the catalog.

Here is the entire available library catalog in JSON format:
${JSON.stringify(catalogData, null, 2)}

Strict constraints:
1. Recommending books NOT in the provided catalog is FORBIDDEN. You must choose from the books provided in the catalog.
2. Select exactly 3 unique books.
3. For each recommended book, provide a friendly, tailored 1-2 sentence reason detailing why it matches their profile (e.g., "Since you have 'Clean Code' on your wishlist, we recommend this book to expand your software design skills").
4. Output your answer strictly as a JSON list matching the response schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "A list of exactly 3 book recommendations matching the catalog",
          items: {
            type: Type.OBJECT,
            properties: {
              bookId: {
                type: Type.INTEGER,
                description: "The ID of the recommended book from the catalog"
              },
              reason: {
                type: Type.STRING,
                description: "A personalized 1-2 sentence description explaining why this book is recommended."
              }
            },
            required: ["bookId", "reason"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text response from Gemini API");
    }

    const recommendations = JSON.parse(text) as RecommendedResultItem[];
    // Filter to ensure recommended bookIds actually exist in our catalog and are unique
    const uniqueRecs: RecommendedResultItem[] = [];
    const seenIds = new Set<number>();

    for (const rec of recommendations) {
      const bookExists = availableBooks.some(b => b.id === rec.bookId);
      if (bookExists && !seenIds.has(rec.bookId)) {
        seenIds.add(rec.bookId);
        uniqueRecs.push(rec);
      }
      if (uniqueRecs.length === 3) break;
    }

    // Fallback if we didn't get 3 valid recommendations
    if (uniqueRecs.length < 3) {
      for (const book of availableBooks) {
        if (!seenIds.has(book.id)) {
          seenIds.add(book.id);
          uniqueRecs.push({
            bookId: book.id,
            reason: "We've highlighted this popular book for you to explore as part of your core academic journey."
          });
        }
        if (uniqueRecs.length === 3) break;
      }
    }

    return uniqueRecs.slice(0, 3);

  } catch (error: any) {
    console.error("Error generating book recommendations with Gemini:", error);
    // Graceful fallback of first 3 books
    const fallback: RecommendedResultItem[] = [];
    const limit = Math.min(availableBooks.length, 3);
    for (let i = 0; i < limit; i++) {
      fallback.push({
        bookId: availableBooks[i].id,
        reason: "Explore this highly requested volume from our central academic archives."
      });
    }
    return fallback;
  }
}
