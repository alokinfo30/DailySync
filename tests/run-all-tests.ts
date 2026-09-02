import { runAutomatedTestSuite } from '../src/lib/testRunner.js';

async function main() {
  console.log('\n======================================================');
  console.log('🧪 CLOUD RUN PERSONAL PRODUCTIVITY AGENT TEST SUITE');
  console.log('   Track 3: Automate Daily Operations with Productivity Agent');
  console.log('   14/14 Automated Tests: Unit, Security, & ADK Agent E2E');
  console.log('======================================================\n');

  const suiteSummary = await runAutomatedTestSuite();

  let index = 1;
  for (const test of suiteSummary.results) {
    const badge = test.passed ? '✅ PASS' : '❌ FAIL';
    const catTag = `[${test.category.toUpperCase()}]`.padEnd(11);
    console.log(`${badge} ${catTag} #${index.toString().padStart(2, '0')} ${test.name} (${test.durationMs}ms)`);
    console.log(`     ↳ ${test.details}`);
    if (test.error) {
      console.log(`     ⚠️ ERROR: ${test.error}`);
    }
    index++;
  }

  console.log('\n------------------------------------------------------');
  console.log(`📊 SUMMARY: ${suiteSummary.passedCount}/${suiteSummary.totalTests} Tests Passing Green (${suiteSummary.allPassed ? '100% SUCCESS' : 'FAILURES PRESENT'})`);
  console.log(`⏱️  Timestamp: ${suiteSummary.executionTimestamp}`);
  console.log('------------------------------------------------------\n');

  if (!suiteSummary.allPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
