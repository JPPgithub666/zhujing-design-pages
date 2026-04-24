/**
 * EdgeOne Pages Edge Function
 * 路由: GET /api/debug/env
 * 功能: 诊断环境变量和 KV 绑定状态
 * 
 * 部署完成后访问此接口查看 env 中的变量
 * ⚠️ 验证完成后建议删除此文件
 */

export async function onRequestGet(context) {
  const { env } = context;
  
  const envKeys = Object.keys(env || {});
  
  // 检查 KV 绑定状态
  let kvStatus = 'NOT_BOUND';
  if (env.contact_kv) {
    kvStatus = 'BOUND';
    try {
      await env.contact_kv.put('_health_check', 'ok');
      const val = await env.contact_kv.get('_health_check');
      kvStatus = val === 'ok' ? 'READ_WRITE_OK' : 'READ_ONLY';
      await env.contact_kv.delete('_health_check');
    } catch (e) {
      kvStatus = 'ERROR: ' + e.message;
    }
  }

  return new Response(JSON.stringify({
    env_keys: envKeys,
    kv_status: kvStatus,
    has_contact_kv: !!env.contact_kv,
    env_keys_detail: envKeys.map(k => {
      const val = env[k];
      const type = typeof val;
      const isKV = val && typeof val.get === 'function' && typeof val.put === 'function';
      return { key: k, type, isKV };
    }),
    timestamp: new Date().toISOString()
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    }
  });
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
