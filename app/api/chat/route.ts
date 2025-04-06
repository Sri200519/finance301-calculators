import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Client } from '@notionhq/client';
import { BlockObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function getPageContent(pageId: string): Promise<{ title: string; content: string } | null> {
  try {
    // Get page metadata
    const page = await notion.pages.retrieve({ page_id: pageId }) as PageObjectResponse;
    const title = (page as any).properties?.title?.title?.[0]?.plain_text || 
                 (page as any).properties?.Name?.title?.[0]?.plain_text || 
                 'Untitled';

    // Get page blocks
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
    });

    const contentParts = [];
    
    // Process each block
    for (const block of blocks.results) {
      const typedBlock = block as BlockObjectResponse;
      
      if (typedBlock.type === 'child_page') {
        // Recursively get content from child pages
        const childContent = await getPageContent(typedBlock.id);
        if (childContent) {
          contentParts.push(`\n## ${childContent.title}\n${childContent.content}`);
        }
        continue;
      }

      // Extract text from different block types
      let text = '';
      switch (typedBlock.type) {
        case 'paragraph':
          if (typedBlock.paragraph.rich_text.length > 0) {
            text = typedBlock.paragraph.rich_text.map(t => t.plain_text).join('');
          }
          break;
        case 'heading_1':
          if (typedBlock.heading_1.rich_text.length > 0) {
            text = '\n# ' + typedBlock.heading_1.rich_text.map(t => t.plain_text).join('');
          }
          break;
        case 'heading_2':
          if (typedBlock.heading_2.rich_text.length > 0) {
            text = '\n## ' + typedBlock.heading_2.rich_text.map(t => t.plain_text).join('');
          }
          break;
        case 'heading_3':
          if (typedBlock.heading_3.rich_text.length > 0) {
            text = '\n### ' + typedBlock.heading_3.rich_text.map(t => t.plain_text).join('');
          }
          break;
        case 'bulleted_list_item':
          if (typedBlock.bulleted_list_item.rich_text.length > 0) {
            text = '\n• ' + typedBlock.bulleted_list_item.rich_text.map(t => t.plain_text).join('');
          }
          break;
        case 'numbered_list_item':
          if (typedBlock.numbered_list_item.rich_text.length > 0) {
            text = '\n• ' + typedBlock.numbered_list_item.rich_text.map(t => t.plain_text).join('');
          }
          break;
        case 'code':
          if (typedBlock.code.rich_text.length > 0) {
            text = '\n```\n' + typedBlock.code.rich_text.map(t => t.plain_text).join('') + '\n```';
          }
          break;
      }
      if (text) contentParts.push(text);
    }

    return {
      title,
      content: contentParts.join('\n')
    };
  } catch (error) {
    console.error('Error fetching page content:', error);
    return null;
  }
}

async function getNotionPages() {
  try {
    // Search for the main Finance Notes page
    const response = await notion.search({
      query: 'Finance Notes',
      filter: {
        property: 'object',
        value: 'page'
      }
    });

    // Find the main Finance Notes page
    const financeNotesPage = response.results.find((page: any) => {
      const title = (page as any).properties?.title?.title?.[0]?.plain_text || 
                   (page as any).properties?.Name?.title?.[0]?.plain_text || 
                   '';
      return title.toLowerCase().includes('finance notes');
    });

    if (!financeNotesPage) {
      console.error('Finance Notes page not found');
      return [];
    }

    // Get content including all child pages
    const content = await getPageContent(financeNotesPage.id);
    return content ? [content] : [];

  } catch (error) {
    console.error('Error searching Notion pages:', error);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Get Notion content
    const notionPages = await getNotionPages();
    const notionContext = notionPages
      .map(page => `${page.title}:\n${page.content}`)
      .join('\n\n');

    // Create system message with context
    const systemMessage = `You are a financial calculator assistant. You have access to financial notes and calculators.

${notionContext}

RESPONSE FORMAT:
1. Keep responses under 3-4 sentences.
2. Provide a rough estimate of the answer but make it clear that it is an approximation.
3. Explain the steps used in the estimate calculation.
4. Direct users to the appropriate calculator for an exact answer and provide instructions on what inputs to use.
5. Format mathematical formulas using KaTeX-compatible syntax:
   - Inline math: \`$variable$\`
   - Display math: \`$$\\displaystyle{formula}$$\`
6. End with a calculator link in this format (based on calculator filenames):
   - "📱 [Use the Lump Sums Calculator](/calculators/lumpsum)"
   - "📱 [Use the Annuity Calculator](/calculators/annuity)"
   - "📱 [Use the Perpetuity Calculator](/calculators/perpetuity)"
   - "📱 [Use the Bond Calculator](/calculators/bond)"
   - "📱 [Use the Tax Calculator](/calculators/tax)"
   - "📱 [Use the Stock Price Calculator](/calculators/dividend)"
   - "📱 [Use the Options Calculator](/calculators/option)"
   - "📱 [Use the Capital Budgeting Calculator](/calculators/capital-budget)"
   - "📱 [Use the Real Options Calculator](/calculators/real-options)"

### Example Response:

To calculate the Net Present Value (NPV), follow these steps:

1. Identify the cash flows, discount rate, and initial investment.
2. Use this formula:  
   $$\\displaystyle{NPV = \\sum_{t=1}^{n} \\frac{CF_t}{(1+r)^t} - \\text{Initial Investment}}$$  
3. Using a quick estimate, the NPV is approximately **\$X.XX** (this is a rough estimate, not an exact answer).
4. To calculate the precise NPV, enter the following values into the Capital Budgeting Calculator:  
   - Initial investment: **\$XX**  
   - Annual cash flows: **\$XX**  
   - Discount rate: **X%**  
   - Number of years: **X**  

📱 [Use the Capital Budgeting Calculator](/calculators/capital-budget)

### GUIDELINES:
- Always label the rough estimate clearly.
- Keep explanations brief and focused on methodology.
- Ensure the calculator links match the exact routes: lumpsum, annuity, perpetuity, bond, tax, dividend, options, capital-budget.
- Guide users on what values to enter into the calculator for an exact answer.
- Use $$\\displaystyle{formula}$$ for main formulas and $variable$ for inline variables.
- Always end responses with the calculator link and usage instructions.
`;

    // Get response from ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    // Format the response to ensure proper line breaks for formulas and proper markdown
    let formattedResponse = completion.choices[0].message.content || '';
    
    // Replace display formulas with proper spacing and formatting
    formattedResponse = formattedResponse.split('$$').map((part, i) => {
      if (i % 2 === 1) { // This is a formula
        const cleanFormula = part.trim().replace(/\\\\displaystyle/g, '\\displaystyle');
        return `\n\n$$${cleanFormula}$$\n\n`;
      }
      return part;
    }).join('');

    // Format inline formulas
    formattedResponse = formattedResponse.replace(/\$(.*?)\$/g, (_, formula) => {
      const cleanFormula = formula.trim().replace(/\\\\displaystyle/g, '\\displaystyle');
      return `$${cleanFormula}$`;
    });
    
    // Format list items with proper spacing
    formattedResponse = formattedResponse.replace(/(?:\n|^)- /g, '\n\n- ');
    
    // Format calculator link to ensure it's on its own line
    formattedResponse = formattedResponse.replace(
      /📱 \[(Use the .* Calculator)\]\((\/calculators\/.*?)\)/g,
      '\n\n📱 [$1]($2)'
    );
    
    // Clean up any excessive newlines
    formattedResponse = formattedResponse
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return NextResponse.json({ 
      response: formattedResponse,
      metadata: {
        hasFormula: formattedResponse.includes('$$') || formattedResponse.includes('$'),
        hasCalculatorLink: formattedResponse.includes('📱 [Use the'),
        calculatorType: formattedResponse.match(/\/calculators\/(.*?)(?:\)|$)/)?.[1] || null
      }
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}