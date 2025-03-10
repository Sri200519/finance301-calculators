# Finance 301 Calculators

This repository contains a collection of financial calculators designed to assist students in Finance 301 at UMass Amherst. The calculators cover key financial concepts such as lump sum value, annuities, perpetuities, and tax calculations.

## Live Website

This project is actively hosted at: [Finance 301 Calculators](https://finance301-calculators.vercel.app/)

## Features

- **AI Chat Assistant**: Interactive chat interface that helps explain financial concepts and guides users to the right calculators
  - Powered by OpenAI's GPT-4
  - Integration with Notion for knowledge base
  - LaTeX formula rendering
  - Smart calculator recommendations
- **Lump Sum Calculator**: Computes the future or present value of a single cash flow
- **Annuity Calculator**: Determines the present or future value of a series of cash flows
- **Perpetuity Calculator**: Calculates the present value of a perpetuity
- **Tax Calculator**: Helps estimate taxes based on progressive tax brackets
- **Bond Calculator**: Calculate bond prices and yields
- **Dividend Calculator**: Compute dividend growth and capital gains
- **Dark Mode Support**: Users can toggle between light and dark themes for a better viewing experience
- **Responsive Design**: Fully functional on both desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **APIs**:
  - OpenAI API for chat functionality
  - Notion API for content management
- **Math Rendering**: KaTeX
- **Markdown**: React-Markdown with math extensions
- **Deployment**: Vercel

## Installation & Development

To run the project locally, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/Sri200519/finance301-calculators.git
   ```
2. Navigate to the project directory:
   ```sh
   cd finance301-calculators
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Set up environment variables:
   ```sh
   # Create a .env.local file with:
   OPENAI_API_KEY=your_openai_api_key
   NOTION_API_KEY=your_notion_api_key
   ```
5. Run the development server:
   ```sh
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

### OpenAI Integration
- Uses GPT-4 for natural language understanding
- Provides step-by-step explanations of financial concepts
- Formats responses with LaTeX for mathematical formulas
- Recommends appropriate calculators based on user queries

### Notion Integration
- Serves as a knowledge base for financial concepts
- Dynamically fetches content from Notion pages
- Supports rich text formatting and mathematical formulas
- Organizes content in a hierarchical structure

## Deployment

The project is deployed on [Vercel](https://vercel.com/). To deploy your own version:

1. Push changes to GitHub
2. Link the repository to a new project on Vercel
3. Add the required environment variables in Vercel:
   - `OPENAI_API_KEY`
   - `NOTION_API_KEY`
4. Vercel will automatically deploy updates on every push to the `main` branch

## Contributions

Contributions are welcome! Feel free to fork the repository and submit pull requests for improvements or new features.

## License

This project is licensed under the MIT License.

---

For any questions or issues, please open an issue on GitHub or contact me directly.

