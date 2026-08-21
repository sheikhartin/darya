/**
 * Math-intelligence suite for the Darya engine.
 *
 * Pins the extended computation layer (factual-math-extras.js) and the
 * math-concept shelf (knowledge-facts-math.js) in both languages and
 * both digit systems:
 *
 *   1. Computation: factorial, GCD/LCM, averages, remainders, parity,
 *      divisibility, percent relations, percent change, cube roots,
 *      absolute value, and rounding all answer with exact arithmetic.
 *   2. Honesty: undefined cases (dividing by zero, factorial of a
 *      negative, oversized factorials) refuse plainly instead of
 *      returning NaN or a fabricated value.
 *   3. Concepts: «عدد پی چیه», "what is a factorial", Pythagoras,
 *      Fibonacci, infinity, averages, and equations answer from the
 *      curated shelf, never the unknown pool.
 *   4. Precedence safety: the new shapes never steal a compound
 *      expression from the full evaluator.
 *
 * This file is additive and permanent: its names describe the behavior
 * under test (math intelligence), not any change or PR.
 */

'use strict';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshEngine, FA, EN } from './helpers.mjs';

/** [language, question, expected pattern] computation table. */
const COMPUTATIONS = [
  // Factorial in every register and both digit systems.
  [FA, 'فاکتوریل ۵ چند میشه؟', /۱۲۰/u],
  [FA, '۶! چنده؟', /۷۲۰/u],
  [EN, 'what is factorial of 6?', /720/u],
  [EN, 'what is 7! ?', /5040/u],
  [FA, 'فاکتوریل صفر چند میشه؟', /۱(?![۰-۹])/u],
  // GCD / LCM with dotted, plain, and long Persian names.
  [FA, 'ب.م.م ۱۲ و ۱۸ چنده؟', /۶/u],
  [FA, 'ب م م ۲۴ و ۳۶ چند میشه', /۱۲/u],
  [FA, 'بزرگترین مقسوم علیه مشترک ۸ و ۲۰ چنده', /۴/u],
  [FA, 'ک.م.م ۴ و ۶ چند میشه؟', /۱۲/u],
  [FA, 'کوچکترین مضرب مشترک ۳ و ۵ چیه', /۱۵/u],
  [EN, 'gcd of 12 and 18', /\b6\b/u],
  [EN, 'what is the greatest common divisor of 8 and 20?', /\b4\b/u],
  [EN, 'lcm of 4 and 6', /\b12\b/u],
  [EN, 'least common multiple of 3 and 5', /\b15\b/u],
  // Averages of short lists.
  [FA, 'میانگین ۳ و ۷ و ۸ چنده؟', /۶/u],
  [FA, 'معدل ۱۰ و ۲۰ چند میشه', /۱۵/u],
  [EN, 'average of 4, 8 and 15', /\b9\b/u],
  [EN, 'what is the mean of 2 and 4?', /\b3\b/u],
  // Remainders / modulo.
  [FA, 'باقیمانده ۱۷ بر ۵ چنده؟', /۲/u],
  [FA, 'باقی مانده تقسیم ۲۲ بر ۷ چند میشه', /۱/u],
  [EN, 'what is the remainder of 17 divided by 5', /\b2\b/u],
  [EN, '17 mod 5 = ?', /\b2\b/u],
  // Parity.
  [FA, '۴۲ زوجه یا فرد؟', /زوج/u],
  [FA, '۷ فرده یا زوج؟', /فرد/u],
  [EN, 'is 41 even or odd?', /odd/iu],
  [EN, 'is 100 an even number?', /even/iu],
  // Divisibility with the honest remainder on the no branch.
  [FA, '۵۱ بر ۳ بخش‌پذیره؟', /بله|۱۷/u],
  [FA, '۵۲ بر ۳ بخش پذیره؟', /نه|باقیمانده/u],
  [EN, 'is 51 divisible by 3?', /yes/iu],
  [EN, 'is 52 divisible by 3?', /no.*remainder/iu],
  // Percent relations and percent change.
  [FA, '۱۵ چند درصد ۶۰ است؟', /۲۵/u],
  [EN, '15 is what percent of 60?', /\b25\b/u],
  [EN, 'what percent of 200 is 50?', /\b25\b/u],
  [FA, 'از ۵۰ به ۶۵ چند درصد رشد کرده؟', /۳۰.*افزایش/u],
  [FA, 'از ۸۰ به ۶۰ چند درصد کم شده؟', /۲۵.*کاهش/u],
  [EN, 'percent change from 50 to 65', /30.*increase/iu],
  [EN, 'percent change from 80 to 60', /25.*decrease/iu],
  // Cube roots, absolute value, rounding.
  [FA, 'ریشه سوم ۲۷ چنده؟', /۳(?![۰-۹])/u],
  [EN, 'cube root of 64', /\b4\b/u],
  [FA, 'قدر مطلق منفی ۷ چنده؟', /۷/u],
  [EN, 'absolute value of -12', /\b12\b/u],
  [FA, 'گرد کن ۳٫۷', /۴/u],
  [EN, 'round 2.4', /\b2\b/u]
];

for (const [lang, question, expected] of COMPUTATIONS) {
  test(`math: ${question}`, () => {
    const reply = freshEngine(lang).respond(question);
    assert.match(reply, expected, `${question} -> ${reply}`);
    assert.doesNotMatch(reply, /NaN|undefined|null/u, reply);
  });
}

// ==========================================================================
// Honesty on undefined and oversized cases
// ==========================================================================

test('math honesty: remainder by zero refuses in both languages', () => {
  assert.match(
    freshEngine(FA).respond('باقیمانده ۵ بر صفر چنده؟'),
    /تعریف‌نشده|تعریف نشده/u
  );
  assert.match(
    freshEngine(EN).respond('remainder of 5 divided by zero'),
    /undefined/iu
  );
});

test('math honesty: factorial of a negative or decimal refuses plainly', () => {
  assert.match(
    freshEngine(FA).respond('فاکتوریل منفی ۳ چنده؟'),
    /نامنفی|تعریف/u
  );
  assert.match(
    freshEngine(EN).respond('factorial of 2.5'),
    /whole|no simple answer/iu
  );
});

test('math honesty: oversized factorials admit the precision limit', () => {
  const fa = freshEngine(FA).respond('فاکتوریل ۵۰ چند میشه؟');
  assert.match(fa, /دقت|بیرون می‌زنه|۲۰/u, fa);
  const en = freshEngine(EN).respond('what is factorial of 100?');
  assert.match(en, /precision|overflow|20/iu, en);
});

test('math honesty: division by zero stays refused in the base layer', () => {
  assert.match(freshEngine(EN).respond('what is 5/0?'), /undefined/iu);
});

test('math honesty: nothing is divisible by zero', () => {
  assert.match(
    freshEngine(EN).respond('is 10 divisible by 0?'),
    /undefined|nothing/iu
  );
});

// ==========================================================================
// Precedence safety: the extras never steal richer expressions
// ==========================================================================

test('math precedence: compound expressions still use the full evaluator', () => {
  assert.match(freshEngine(EN).respond('what is 2+2*3?'), /= 8/u);
  assert.match(freshEngine(FA).respond('۲+۲*۳ چند میشه؟'), /۸/u);
  assert.match(freshEngine(EN).respond('what is (2+3)*4?'), /= 20/u);
});

test('math precedence: plain percent-of keeps its dedicated path', () => {
  assert.match(freshEngine(EN).respond('what is 20% of 150?'), /\b30\b/u);
});

test('math precedence: square roots still answer, including negatives', () => {
  assert.match(freshEngine(EN).respond('square root of 144'), /\b12\b/u);
  assert.match(freshEngine(FA).respond('جذر ۱۶ چنده؟'), /۴/u);
  assert.match(freshEngine(FA).respond('جذر منفی ۹ چنده؟'), /حقیقی ندار[ده]/u);
});

test('math precedence: prime checks still answer alongside the concept', () => {
  assert.match(freshEngine(EN).respond('is 17 a prime number?'), /yes/iu);
  assert.match(freshEngine(FA).respond('آیا ۱۳ عدد اول است؟'), /بله/u);
});

// ==========================================================================
// Concepts: the shelf explains what the calculator computes
// ==========================================================================

const CONCEPTS = [
  [FA, 'عدد پی چیه؟', /دایره|۳٫۱۴/u],
  [EN, 'what is pi?', /circle|3\.14/iu],
  [FA, 'عدد اول چیه؟', /بخش‌پذیر|آجر|رمزنگاری/u],
  [EN, 'what are prime numbers?', /divides|building blocks|encryption/iu],
  [FA, 'فاکتوریل چیه؟', /ضرب|۲۴/u],
  [EN, 'what is a factorial?', /multiplies|24/iu],
  [FA, 'ب.م.م چیه؟', /مقسوم‌علیه|کسر/u],
  [EN, 'what is gcd?', /divisor|fraction/iu],
  [FA, 'میانگین چیه؟', /جمع|میانه|تقسیم/u],
  [EN, 'what is the mean in math?', /average|middle|sorted/iu],
  [FA, 'درصد چیه؟', /صد|۰٫۲|ضرب/u],
  [EN, 'how do percentages work?', /hundred|multiply/iu],
  [FA, 'دنباله فیبوناچی چیه؟', /جمع دو عدد قبلی|طلایی/u],
  [EN, 'what is the fibonacci sequence?', /sum of the previous|golden/iu],
  [FA, 'قضیه فیثاغورس چیه؟', /وتر|مثلث/u],
  [EN, 'what is the pythagorean theorem?', /hypotenuse|triangle/iu],
  [FA, 'بی نهایت چیه؟', /مفهوم|کانتور|پایان/u],
  [EN, 'is infinity a number?', /concept|Cantor|without end/iu],
  [FA, 'معادله چیه؟', /ترازو|مجهول|خوارزمی/u],
  [EN, 'what is algebra?', /scale|unknown|al-jabr/iu]
];

for (const [lang, question, expected] of CONCEPTS) {
  test(`math concept: ${question}`, () => {
    const reply = freshEngine(lang).respond(question);
    assert.match(reply, expected, `${question} -> ${reply}`);
  });
}

test('math concept: «من استرس دارم» is never hijacked by math shapes', () => {
  // A feeling with no numbers must stay with the emotional pools.
  const reply = freshEngine(FA).respond('از درسام عقبم و استرس دارم');
  assert.doesNotMatch(reply, /مساوی است با|مساویه با/u, reply);
});
