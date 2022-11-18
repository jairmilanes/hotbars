

function test1(n) {
  for (let i=1; i<=n; i++) {
    if ((n % i) === 0) {
      return false
    }
  }
  return true
}

/* function test1(n) {
  for (let i=1; i<=n; i++) {
    if ((n & i) === 0) {
      return false
    }
  }
  return true
} */

function test3(n) {
  for (let i=2; i<n; i++) {
    if ((n % i) === 0) {
      return false
    }
  }
  return true
}

function test4(n) {
  for (let i=1; i<n; i++) {
    if ((n % i) === 0) {
      return false
    }
  }
  return true
}

[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
  .forEach(num => {
    console.log(`fn1=${test1(num)} | fn3=${test3(num)} | fn4=${test4(num)} | `);
  })