for (var a = document.getElementById("myCanvas").getContext("2d"), b = [], c = 0; 500 > c; c++) {
  b[c] = [];
  for (var e = 0; 700 > e; e++) {
    b[c][e] = Math.random();
  }
}
var f = 0.0;
ready = [];
cost = [];
instruction = [];
done = [];
var g = Math.floor(500 * Math.random()), h = Math.floor(700 * Math.random());
ready.push(700 * g + h);
for (c = cost[700 * g + h] = 0; 500 > c; c++) {
  console.log(c);
  for (var k = 0; 700 > k; k++) {
    var l = cost[ready[0]], n = ready[0];
    ready.forEach(function(d) {
      cost[d] < l && (n = d, l = cost[d]);
    });
    ready = ready.filter(function(d) {
      return d != n;
    });
    done[n] = !0;
    var p = Math.floor(n / 700), q = n % 700;
    0 < p && r(700 * (p - 1) + q, l + b[p - 1][q]);
    500 > p + 1 && r(700 * (p + 1) + q, l + b[p + 1][q]);
    0 < q && r(700 * p + q - 1, l + b[p][q - 1]);
    700 > q + 1 && r(700 * p + q + 1, l + b[p][q + 1]);
    0 < p && 0 < q && r(700 * (p - 1) + q - 1, l + Math.sqrt(2) * b[p - 1][q - 1]);
    500 > p + 1 && 700 > q + 1 && r(700 * (p + 1) + q + 1, l + Math.sqrt(2) * b[p + 1][q + 1]);
    500 > p + 1 && 0 < q && r(700 * (p + 1) + q - 1, l + Math.sqrt(2) * b[p + 1][q - 1]);
    0 < p && 700 > q + 1 && r(700 * (p - 1) + q + 1, l + Math.sqrt(2) * b[p - 1][q + 1]);
    f = l;
  }
}
for (c = 0; 700 > c; c++) {
  for (e = 0; 500 > e; e++) {
    var t = cost[c + 700 * e] / f * 256;
    a.fillStyle = "rgb(" + t + ", " + t + ", " + t + ")";
    a.fillRect(1 * c, 1 * e, 1, 1);
  }
}
function r(d, m) {
  var u = n, v = ready, w = cost, x = instruction;
  if (!done[d]) {
    var y = v.find(function(z) {
      return z == d;
    });
    y ? m < y.a && (x[d] = u, w[d] = m) : (v.push(d), x[d] = u, w[d] = m);
  }
}
