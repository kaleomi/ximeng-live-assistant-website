const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),manifest=JSON.parse(fs.readFileSync(path.join(root,'update.json'),'utf8'));
test('visible version, latest release note and update feed agree',()=>{
  for(const source of [html.match(/<title>([\s\S]*?)<\/title>/)[1],html.match(/class="eyebrow">([\s\S]*?)<\/div>/)[1],html.match(/class="update-card current reveal">([\s\S]*?)<\/article>/)[1]])assert.ok(source.includes(manifest.version));
  assert.match(manifest.version,/^\d+\.\d+\.\d+$/);assert.equal(manifest.schemaVersion,1);assert.match(manifest.sha256,/^[A-F0-9]{64}$/);assert.ok(manifest.notes.length>=4);
});
test('download, purchase, docs and game destinations remain unchanged',()=>{
  for(const link of ['https://pan.quark.cn/s/72c0295bae28?pwd=a874','https://pan.baidu.com/s/1RCAloZ0RXzoDAYTDllc0FA?pwd=ffgn','https://wzyp.cn/shop/xialuoxi/318613','https://lcnod4qb2omp.feishu.cn/wiki/C0IrwCaTNi3jTckDICwcgnD4ngh?from=from_copylink','https://game-live.xialuoxi.com/'])assert.ok(html.includes(`href="${link}"`),link);
  assert.equal(manifest.downloadUrl,'https://pan.quark.cn/s/72c0295bae28?pwd=a874');
});
test('assets, fragment targets and guide tabs exist with one selected app pane',()=>{
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const value=match[1];if(value.startsWith('#'))assert.ok(ids.includes(value.slice(1)),value);
    else if(!/^https?:/.test(value))assert.ok(fs.existsSync(path.join(root,value.split('?')[0])),value);
  }
  const buttons=[...html.matchAll(/<button[^>]*data-guide="([^"]+)"[^>]*>/g)];assert.equal(buttons.length,4);
  assert.equal(buttons.filter(x=>x[0].includes('aria-selected="true"')).length,1);assert.equal(buttons.find(x=>x[0].includes('aria-selected="true"'))[1],'app');
  assert.match(html,/<article class="guide-pane active" id="guide-app" role="tabpanel">/);
  for(const b of buttons)assert.ok(ids.includes('guide-'+b[1]));
});
test('2.1.26 documentation reflects actual scope and local deployment',()=>{
  for(const value of ['Edge TTS','B站','DyCast.exe','11435–11445','40 GiB','ximeng-bilibili','最长 24 小时','首次激活起 30 天','已有云端配置'])assert.ok(html.includes(value),value);
  assert.doesNotMatch(html,/虚拟送礼|快手定制|OllamaSetup\.exe|一键安装本地大模型\.exe|三种语音引擎|三个安装包/);
  assert.doesNotMatch(html,/(?:[A-Z]:\\(?:Users|Documents)|localhost:\d+\/index\.html)/);
  assert.ok(html.includes('不能只')||html.includes('不要只'));assert.ok(html.includes('原有系统 Ollama 的 11434'));
});
test('release notes preserve history and latest metadata matches the installer when supplied',()=>{
  assert.ok(html.includes('v2.1.19'));assert.ok(html.includes('v2.1.25'));assert.ok(html.includes('v2.1.24'));
  if(process.env.XIMENG_INSTALLER_PATH)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(process.env.XIMENG_INSTALLER_PATH)).digest('hex').toUpperCase(),manifest.sha256);
});
test('external documentation link does not break guide tab initialization',()=>{
  const script=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert.ok(script.includes("href.startsWith('#')"));
  assert.doesNotMatch(script,/document\.querySelector\(link\.getAttribute\('href'\)\)/);
});
