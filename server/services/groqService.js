const Groq = require('groq-sdk');

class GroqService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    this.model = 'llama-3.3-70b-versatile'; // Fast and capable model
  }

  /**
   * Generate a chat completion with context
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Object} options - Additional options (temperature, max_tokens, etc.)
   */
  async chat(messages, options = {}) {
    try {
      const completion = await this.groq.chat.completions.create({
        messages,
        model: options.model || this.model,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2048,
        top_p: options.top_p || 1,
        stream: false,
        stop: options.stop || null
      });

      return {
        success: true,
        content: completion.choices[0]?.message?.content || '',
        usage: completion.usage
      };
    } catch (error) {
      console.error('❌ Groq API Error:', error);
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * Generate embeddings (Note: Groq doesn't support embeddings natively)
   * This is a placeholder - in production, you'd use OpenAI or another service
   */
  async generateEmbedding(text) {
    // Placeholder - implement with OpenAI or similar service if needed
    return null;
  }

  /**
   * Function calling / tool use with structured output
   */
  async chatWithTools(messages, tools, options = {}) {
    try {
      const completion = await this.groq.chat.completions.create({
        messages,
        model: options.model || this.model,
        tools,
        tool_choice: options.tool_choice || 'auto',
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2048
      });

      const response = completion.choices[0];
      
      return {
        success: true,
        message: response.message,
        toolCalls: response.message.tool_calls || [],
        usage: completion.usage
      };
    } catch (error) {
      console.error('❌ Groq Function Calling Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Streaming chat completion
   */
  async *chatStream(messages, options = {}) {
    try {
      const stream = await this.groq.chat.completions.create({
        messages,
        model: options.model || this.model,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2048,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('❌ Groq Streaming Error:', error);
      throw error;
    }
  }
}

module.exports = new GroqService();
