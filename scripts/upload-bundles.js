'use strict';

/**
 * scripts/output/bundles/*.json 전체를 Supabase에 upsert한다.
 *
 * 실행:
 *   cd scripts && node upload-bundles.js
 *
 * 전제:
 *   scripts/.env 에 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 설정
 *   Supabase expressions + stories 테이블 존재 (SUPABASE1 완료)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { upsertBundle } = require('./lib/supabase');

const BUNDLES_DIR = path.join(__dirname, 'output', 'bundles');
const BATCH_SIZE = 10; // 동시 처리 수

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const files = fs.readdirSync(BUNDLES_DIR).filter((f) => f.endsWith('.json'));
  const total = files.length;

  console.log(`총 ${total}개 번들 업로드 시작`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (file) => {
        try {
          const bundle = JSON.parse(fs.readFileSync(path.join(BUNDLES_DIR, file), 'utf8'));
          await upsertBundle(bundle);
          successCount++;
          process.stdout.write(`\r진행: ${successCount + failCount}/${total} (성공: ${successCount}, 실패: ${failCount})`);
        } catch (err) {
          failCount++;
          console.error(`\n[실패] ${file}: ${err.message}`);
        }
      })
    );

    // Rate limit 방지
    if (i + BATCH_SIZE < files.length) {
      await sleep(100);
    }
  }

  console.log(`\n\n업로드 완료`);
  console.log(`성공: ${successCount}개`);
  console.log(`실패: ${failCount}개`);
}

main().catch((err) => {
  console.error('[upload-bundles] Fatal:', err.message);
  process.exit(1);
});
