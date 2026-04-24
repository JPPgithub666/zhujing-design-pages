/**
 * EdgeOne Pages Edge Function
 * 路由: POST /api/ai/chat
 * 功能: AI 智能客服代理 - 调用大模型 API 实现流式对话
 * 
 * 环境变量:
 *   AI_API_KEY    - 大模型 API Key（如 DeepSeek API Key）
 *   AI_MODEL      - 默认模型名称（如 deepseek-chat）
 *   AI_BASE_URL   - API 基础 URL（如 https://api.deepseek.com）
 * 
 * 支持流式输出，前端可逐字显示 AI 回复
 */

// 筑境设计专属系统提示词
const SYSTEM_PROMPT = `你是「筑境设计」的AI智能助手。筑境设计是一家成立于2004年的综合性城市规划设计研究院，总部位于上海，在北京、深圳、成都设有分公司。

核心信息：
- 设计理念：「筑以载道，境由人心」
- 业务领域：城市规划、建筑设计、景观设计、室内设计、城市更新、乡村振兴、咨询研究、BIM与数字化
- 核心数据：20年+经验、600+项目、28+省份、45+设计奖项
- 代表项目：钱塘滨水新城总体规划、云上文化艺术中心、西溪湿地生态修复工程、苏州河畔工业遗产活化、粤港澳大湾区科创走廊规划、星河TOD商业综合体
- 团队：创始人陈明远（哈佛GSD）、联合创始人林若溪（MIT城市规划博士）、技术总监张瀚文（清华）、景观总监苏婉清（宾大）
- 联系方式：上海市黄浦区南京东路388号筑境大厦28F，电话021-6388-8888，邮箱hello@zhujing-design.com

回答要求：
1. 语气专业但亲和，展现高端设计事务所的气质
2. 主动了解客户需求，引导进一步沟通
3. 回答涉及具体项目方案时，建议客户通过官网表单或电话联系团队获取详细咨询
4. 用简体中文回答，适当使用建筑/设计专业术语
5. 回答简洁有力，一般控制在200字以内
6. 如果用户问的问题与筑境设计无关，礼貌地引导回设计相关话题`;

// 支持的模型配置
const MODEL_CONFIGS = {
  'deepseek-chat': {
    baseUrl: 'https://api.deepseek.com',
    path: '/chat/completions'
  },
  'deepseek-reasoner': {
    baseUrl: 'https://api.deepseek.com',
    path: '/chat/completions'
  },
  'glm-4-flash': {
    baseUrl: 'https://open.bigmodel.cn/api/paas',
    path: '/v4/chat/completions'
  }
};

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { messages, model } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: '消息格式无效' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取模型配置
    const modelName = model || env.AI_MODEL || 'deepseek-chat';
    const config = MODEL_CONFIGS[modelName];

    if (!config) {
      return new Response(JSON.stringify({
        error: `不支持的模型: ${modelName}`,
        available: Object.keys(MODEL_CONFIGS)
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取 API Key
    const apiKey = env.AI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'AI 服务暂未配置，请联系管理员',
        hint: '请在 EdgeOne Pages 控制台设置环境变量 AI_API_KEY'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 构造请求体
    const requestBody = {
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9
    };

    // 调用 AI API（流式）
    const baseUrl = env.AI_BASE_URL || config.baseUrl;
    const aiResponse = await fetch(baseUrl + config.path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({
        error: `AI 服务响应异常 (${aiResponse.status})`,
        detail: errorText.substring(0, 200)
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 流式返回 AI 响应
    return new Response(aiResponse.body, {
      status: aiResponse.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('AI chat function error:', error);
    return new Response(JSON.stringify({
      error: 'AI 服务处理异常',
      detail: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// CORS 预检
export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
