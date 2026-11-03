/* Per-company payroll formula: the rates each company is calculated with, and the calculation itself.
   Used by payroll.html and formulas.html so both always agree. */
(function () {
  var KEY = 'rmvFormulas', LEGACY = 'rmvPayrollRates';
  var DEF = { pf: 12, esi: 0.75, svc: 10, pfEr: 13, esiEr: 4.75, gst: 9 };

  var load = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
  var store = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  // rounding used by the register: nearest (.5 up) for basic and PF, nearest (.5 down) for the earned gross, round up for charges
  var up   = function (x) { return Math.floor(x + 0.5 + 1e-9); };
  var down = function (x) { return Math.ceil(x - 0.5 - 1e-9); };
  var ceil = function (x) { return Math.ceil(x - 1e-9); };
  var ceil1 = function (x) { return Math.ceil(Math.round(x * 10) / 10 - 1e-9); };   // ESI: a few paise over a whole rupee stay at that rupee, as in the register

  function own(company) { return load(KEY, {})[company] || null; }
  // a company's own formula, else the old shared rates (if any were saved), else the defaults
  function getRates(company) { return Object.assign({}, DEF, load(LEGACY, {}), own(company) || {}); }
  function setRates(company, r) { var a = load(KEY, {}); a[company] = r; store(KEY, a); }
  function resetRates(company) { var a = load(KEY, {}); delete a[company]; store(KEY, a); }
  function hasOwn(company) { return !!own(company); }

  // i: { rate, hra, days, payable, abs, adv, ot, arrear, meals }   r: rates
  function compute(i, r) {
    var days = i.days, paid = Math.max(0, i.payable - i.abs);
    var AZ = i.rate * days, BF = AZ + i.hra + i.ot + i.arrear + i.meals;      // full month
    var ratio = days ? paid / days : 0;
    var BU = up(AZ * ratio), BV = down((AZ + i.hra) * ratio) - BU;            // earned this month
    if (i.regBU != null && i.regBV != null) { BU = i.regBU; BV = i.regBV; }    // figures taken straight from the imported register
    var BY = BU + BV + i.ot + i.arrear + i.meals;
    var PF = up(BU * r.pf / 100), ESI = ceil1(BY * r.esi / 100);
    var ded = PF + ESI + i.adv, net = BY - ded;
    var BL = BF, BM = ceil(BL * r.svc / 100), BN = ceil(AZ * r.pfEr / 100), BO = ceil(BF * r.esiEr / 100);   // client invoice
    var BP = BL + BM + BN + BO, BQ = ceil(BP * r.gst / 100), BR = BQ, BS = BP + BQ + BR;
    return { paid: paid, AZ: AZ, BF: BF, BU: BU, BV: BV, BY: BY, PF: PF, ESI: ESI, ded: ded, net: net,
             BL: BL, BM: BM, BN: BN, BO: BO, BP: BP, BQ: BQ, BR: BR, BS: BS };
  }

  window.RMVFormula = { DEF: DEF, getRates: getRates, setRates: setRates, resetRates: resetRates, hasOwn: hasOwn, compute: compute };
})();
