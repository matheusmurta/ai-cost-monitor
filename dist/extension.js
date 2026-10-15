"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/sql.js/dist/sql-wasm.js
var require_sql_wasm = __commonJS({
  "node_modules/sql.js/dist/sql-wasm.js"(exports2, module2) {
    var initSqlJsPromise = void 0;
    var initSqlJs2 = function(moduleConfig) {
      if (initSqlJsPromise) {
        return initSqlJsPromise;
      }
      initSqlJsPromise = new Promise(function(resolveModule, reject) {
        var Module = typeof moduleConfig !== "undefined" ? moduleConfig : {};
        var originalOnAbortFunction = Module["onAbort"];
        Module["onAbort"] = function(errorThatCausedAbort) {
          reject(new Error(errorThatCausedAbort));
          if (originalOnAbortFunction) {
            originalOnAbortFunction(errorThatCausedAbort);
          }
        };
        Module["postRun"] = Module["postRun"] || [];
        Module["postRun"].push(function() {
          resolveModule(Module);
        });
        module2 = void 0;
        var k;
        k ||= typeof Module != "undefined" ? Module : {};
        var aa = !!globalThis.window, ba = !!globalThis.WorkerGlobalScope, ca = globalThis.process?.versions?.node && "renderer" != globalThis.process?.type;
        k.onRuntimeInitialized = function() {
          function a(f, l) {
            switch (typeof l) {
              case "boolean":
                dc(f, l ? 1 : 0);
                break;
              case "number":
                ec(f, l);
                break;
              case "string":
                fc(f, l, -1, -1);
                break;
              case "object":
                if (null === l) lb(f);
                else if (null != l.length) {
                  var n = da(l.length);
                  m.set(l, n);
                  gc(f, n, l.length, -1);
                  ea(n);
                } else va(f, "Wrong API use : tried to return a value of an unknown type (" + l + ").", -1);
                break;
              default:
                lb(f);
            }
          }
          function b(f, l) {
            for (var n = [], p = 0; p < f; p += 1) {
              var r = t(l + 4 * p, "i32"), w = hc(r);
              if (1 === w || 2 === w) r = ic(r);
              else if (3 === w) r = jc(r);
              else if (4 === w) {
                w = r;
                r = kc(w);
                w = lc(w);
                for (var J = new Uint8Array(r), I = 0; I < r; I += 1) J[I] = m[w + I];
                r = J;
              } else r = null;
              n.push(r);
            }
            return n;
          }
          function c(f, l) {
            this.Qa = f;
            this.db = l;
            this.Oa = 1;
            this.mb = [];
          }
          function d(f, l) {
            this.db = l;
            this.fb = fa(f);
            if (null === this.fb) throw Error("Unable to allocate memory for the SQL string");
            this.lb = this.fb;
            this.$a = this.sb = null;
          }
          function e(f) {
            this.filename = "dbfile_" + (4294967295 * Math.random() >>> 0);
            if (null != f) {
              var l = this.filename, n = "/", p = l;
              n && (n = "string" == typeof n ? n : ha(n), p = l ? ia(n + "/" + l) : n);
              l = ja(true, true);
              p = ka(
                p,
                l
              );
              if (f) {
                if ("string" == typeof f) {
                  n = Array(f.length);
                  for (var r = 0, w = f.length; r < w; ++r) n[r] = f.charCodeAt(r);
                  f = n;
                }
                ma(p, l | 146);
                n = na(p, 577);
                oa(n, f, 0, f.length, 0);
                pa(n);
                ma(p, l);
              }
            }
            this.handleError(q(this.filename, g));
            this.db = t(g, "i32");
            ob(this.db);
            this.gb = {};
            this.Sa = {};
          }
          var g = y(4), h = k.cwrap, q = h("sqlite3_open", "number", ["string", "number"]), v = h("sqlite3_close_v2", "number", ["number"]), u = h("sqlite3_exec", "number", ["number", "string", "number", "number", "number"]), x = h("sqlite3_changes", "number", ["number"]), D = h(
            "sqlite3_prepare_v2",
            "number",
            ["number", "string", "number", "number", "number"]
          ), pb = h("sqlite3_sql", "string", ["number"]), nc = h("sqlite3_normalized_sql", "string", ["number"]), qb = h("sqlite3_prepare_v2", "number", ["number", "number", "number", "number", "number"]), oc = h("sqlite3_bind_text", "number", ["number", "number", "number", "number", "number"]), rb = h("sqlite3_bind_blob", "number", ["number", "number", "number", "number", "number"]), pc = h("sqlite3_bind_double", "number", ["number", "number", "number"]), qc = h("sqlite3_bind_int", "number", [
            "number",
            "number",
            "number"
          ]), rc = h("sqlite3_bind_parameter_index", "number", ["number", "string"]), sc = h("sqlite3_step", "number", ["number"]), tc = h("sqlite3_errmsg", "string", ["number"]), uc = h("sqlite3_column_count", "number", ["number"]), vc = h("sqlite3_data_count", "number", ["number"]), wc = h("sqlite3_column_double", "number", ["number", "number"]), sb = h("sqlite3_column_text", "string", ["number", "number"]), xc = h("sqlite3_column_blob", "number", ["number", "number"]), yc = h("sqlite3_column_bytes", "number", ["number", "number"]), zc = h(
            "sqlite3_column_type",
            "number",
            ["number", "number"]
          ), Ac = h("sqlite3_column_name", "string", ["number", "number"]), Bc = h("sqlite3_reset", "number", ["number"]), Cc = h("sqlite3_clear_bindings", "number", ["number"]), Dc = h("sqlite3_finalize", "number", ["number"]), tb = h("sqlite3_create_function_v2", "number", "number string number number number number number number number".split(" ")), hc = h("sqlite3_value_type", "number", ["number"]), kc = h("sqlite3_value_bytes", "number", ["number"]), jc = h("sqlite3_value_text", "string", ["number"]), lc = h(
            "sqlite3_value_blob",
            "number",
            ["number"]
          ), ic = h("sqlite3_value_double", "number", ["number"]), ec = h("sqlite3_result_double", "", ["number", "number"]), lb = h("sqlite3_result_null", "", ["number"]), fc = h("sqlite3_result_text", "", ["number", "string", "number", "number"]), gc = h("sqlite3_result_blob", "", ["number", "number", "number", "number"]), dc = h("sqlite3_result_int", "", ["number", "number"]), va = h("sqlite3_result_error", "", ["number", "string", "number"]), ub = h("sqlite3_aggregate_context", "number", ["number", "number"]), ob = h(
            "RegisterExtensionFunctions",
            "number",
            ["number"]
          ), vb = h("sqlite3_update_hook", "number", ["number", "number", "number"]);
          c.prototype.bind = function(f) {
            if (!this.Qa) throw "Statement closed";
            this.reset();
            return Array.isArray(f) ? this.Gb(f) : null != f && "object" === typeof f ? this.Hb(f) : true;
          };
          c.prototype.step = function() {
            if (!this.Qa) throw "Statement closed";
            this.Oa = 1;
            var f = sc(this.Qa);
            switch (f) {
              case 100:
                return true;
              case 101:
                return false;
              default:
                throw this.db.handleError(f);
            }
          };
          c.prototype.Ab = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            return wc(this.Qa, f);
          };
          c.prototype.Ob = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            f = sb(this.Qa, f);
            if ("function" !== typeof BigInt) throw Error("BigInt is not supported");
            return BigInt(f);
          };
          c.prototype.Tb = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            return sb(this.Qa, f);
          };
          c.prototype.getBlob = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            var l = yc(this.Qa, f);
            f = xc(this.Qa, f);
            for (var n = new Uint8Array(l), p = 0; p < l; p += 1) n[p] = m[f + p];
            return n;
          };
          c.prototype.get = function(f, l) {
            l = l || {};
            null != f && this.bind(f) && this.step();
            f = [];
            for (var n = vc(this.Qa), p = 0; p < n; p += 1) switch (zc(this.Qa, p)) {
              case 1:
                var r = l.useBigInt ? this.Ob(p) : this.Ab(p);
                f.push(r);
                break;
              case 2:
                f.push(this.Ab(p));
                break;
              case 3:
                f.push(this.Tb(p));
                break;
              case 4:
                f.push(this.getBlob(p));
                break;
              default:
                f.push(null);
            }
            return f;
          };
          c.prototype.qb = function() {
            for (var f = [], l = uc(this.Qa), n = 0; n < l; n += 1) f.push(Ac(this.Qa, n));
            return f;
          };
          c.prototype.zb = function(f, l) {
            f = this.get(f, l);
            l = this.qb();
            for (var n = {}, p = 0; p < l.length; p += 1) n[l[p]] = f[p];
            return n;
          };
          c.prototype.Sb = function() {
            return pb(this.Qa);
          };
          c.prototype.Pb = function() {
            return nc(this.Qa);
          };
          c.prototype.run = function(f) {
            null != f && this.bind(f);
            this.step();
            return this.reset();
          };
          c.prototype.wb = function(f, l) {
            null == l && (l = this.Oa, this.Oa += 1);
            f = fa(f);
            this.mb.push(f);
            this.db.handleError(oc(this.Qa, l, f, -1, 0));
          };
          c.prototype.Fb = function(f, l) {
            null == l && (l = this.Oa, this.Oa += 1);
            var n = da(f.length);
            m.set(f, n);
            this.mb.push(n);
            this.db.handleError(rb(this.Qa, l, n, f.length, 0));
          };
          c.prototype.vb = function(f, l) {
            null == l && (l = this.Oa, this.Oa += 1);
            this.db.handleError((f === (f | 0) ? qc : pc)(
              this.Qa,
              l,
              f
            ));
          };
          c.prototype.Ib = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            rb(this.Qa, f, 0, 0, 0);
          };
          c.prototype.xb = function(f, l) {
            null == l && (l = this.Oa, this.Oa += 1);
            switch (typeof f) {
              case "string":
                this.wb(f, l);
                return;
              case "number":
                this.vb(f, l);
                return;
              case "bigint":
                this.wb(f.toString(), l);
                return;
              case "boolean":
                this.vb(f + 0, l);
                return;
              case "object":
                if (null === f) {
                  this.Ib(l);
                  return;
                }
                if (null != f.length) {
                  this.Fb(f, l);
                  return;
                }
            }
            throw "Wrong API use : tried to bind a value of an unknown type (" + f + ").";
          };
          c.prototype.Hb = function(f) {
            var l = this;
            Object.keys(f).forEach(function(n) {
              var p = rc(l.Qa, n);
              0 !== p && l.xb(f[n], p);
            });
            return true;
          };
          c.prototype.Gb = function(f) {
            for (var l = 0; l < f.length; l += 1) this.xb(f[l], l + 1);
            return true;
          };
          c.prototype.reset = function() {
            this.freemem();
            return 0 === Cc(this.Qa) && 0 === Bc(this.Qa);
          };
          c.prototype.freemem = function() {
            for (var f; void 0 !== (f = this.mb.pop()); ) ea(f);
          };
          c.prototype.Ya = function() {
            this.freemem();
            var f = 0 === Dc(this.Qa);
            delete this.db.gb[this.Qa];
            this.Qa = 0;
            return f;
          };
          d.prototype.next = function() {
            if (null === this.fb) return { done: true };
            null !== this.$a && (this.$a.Ya(), this.$a = null);
            if (!this.db.db) throw this.ob(), Error("Database closed");
            var f = qa(), l = y(4);
            ra(g);
            ra(l);
            try {
              this.db.handleError(qb(this.db.db, this.lb, -1, g, l));
              this.lb = t(l, "i32");
              var n = t(g, "i32");
              if (0 === n) return this.ob(), { done: true };
              this.$a = new c(n, this.db);
              this.db.gb[n] = this.$a;
              return { value: this.$a, done: false };
            } catch (p) {
              throw this.sb = z(this.lb), this.ob(), p;
            } finally {
              sa(f);
            }
          };
          d.prototype.ob = function() {
            ea(this.fb);
            this.fb = null;
          };
          d.prototype.Qb = function() {
            return null !== this.sb ? this.sb : z(this.lb);
          };
          "function" === typeof Symbol && "symbol" === typeof Symbol.iterator && (d.prototype[Symbol.iterator] = function() {
            return this;
          });
          e.prototype.run = function(f, l) {
            if (!this.db) throw "Database closed";
            if (l) {
              f = this.tb(f, l);
              try {
                f.step();
              } finally {
                f.Ya();
              }
            } else this.handleError(u(this.db, f, 0, 0, g));
            return this;
          };
          e.prototype.exec = function(f, l, n) {
            if (!this.db) throw "Database closed";
            var p = qa(), r = null, w = null, J = null;
            try {
              J = w = fa(f);
              var I = y(4);
              for (f = []; 0 !== t(J, "i8"); ) {
                ra(g);
                ra(I);
                this.handleError(qb(this.db, J, -1, g, I));
                var L = t(g, "i32");
                J = t(I, "i32");
                if (0 !== L) {
                  var G = null;
                  r = new c(L, this);
                  for (null != l && r.bind(l); r.step(); ) null === G && (G = { columns: r.qb(), values: [] }, f.push(G)), G.values.push(r.get(null, n));
                  r.Ya();
                }
              }
              return f;
            } catch (la) {
              throw r && r.Ya(), la;
            } finally {
              w && ea(w), sa(p);
            }
          };
          e.prototype.Mb = function(f, l, n, p, r) {
            "function" === typeof l && (p = n, n = l, l = void 0);
            f = this.tb(f, l);
            try {
              for (; f.step(); ) n(f.zb(null, r));
            } finally {
              f.Ya();
            }
            if ("function" === typeof p) return p();
          };
          e.prototype.tb = function(f, l) {
            ra(g);
            this.handleError(D(this.db, f, -1, g, 0));
            f = t(g, "i32");
            if (0 === f) throw "Nothing to prepare";
            var n = new c(f, this);
            null != l && n.bind(l);
            return this.gb[f] = n;
          };
          e.prototype.Ub = function(f) {
            return new d(f, this);
          };
          e.prototype.Nb = function() {
            Object.values(this.gb).forEach(function(l) {
              l.Ya();
            });
            Object.values(this.Sa).forEach(A);
            this.Sa = {};
            this.handleError(v(this.db));
            var f = ta(this.filename);
            this.handleError(q(this.filename, g));
            this.db = t(g, "i32");
            ob(this.db);
            return f;
          };
          e.prototype.close = function() {
            null !== this.db && (Object.values(this.gb).forEach(function(f) {
              f.Ya();
            }), Object.values(this.Sa).forEach(A), this.Sa = {}, this.Za && (A(this.Za), this.Za = void 0), this.handleError(v(this.db)), ua("/" + this.filename), this.db = null);
          };
          e.prototype.handleError = function(f) {
            if (0 === f) return null;
            f = tc(this.db);
            throw Error(f);
          };
          e.prototype.Rb = function() {
            return x(this.db);
          };
          e.prototype.Kb = function(f, l) {
            Object.prototype.hasOwnProperty.call(this.Sa, f) && (A(this.Sa[f]), delete this.Sa[f]);
            var n = wa(function(p, r, w) {
              r = b(r, w);
              try {
                var J = l.apply(null, r);
              } catch (I) {
                va(p, I, -1);
                return;
              }
              a(p, J);
            }, "viii");
            this.Sa[f] = n;
            this.handleError(tb(this.db, f, l.length, 1, 0, n, 0, 0, 0));
            return this;
          };
          e.prototype.Jb = function(f, l) {
            var n = l.init || function() {
              return null;
            }, p = l.finalize || function(L) {
              return L;
            }, r = l.step;
            if (!r) throw "An aggregate function must have a step function in " + f;
            var w = {};
            Object.hasOwnProperty.call(this.Sa, f) && (A(this.Sa[f]), delete this.Sa[f]);
            l = f + "__finalize";
            Object.hasOwnProperty.call(this.Sa, l) && (A(this.Sa[l]), delete this.Sa[l]);
            var J = wa(function(L, G, la) {
              var V = ub(L, 1);
              Object.hasOwnProperty.call(w, V) || (w[V] = n());
              G = b(G, la);
              G = [w[V]].concat(G);
              try {
                w[V] = r.apply(null, G);
              } catch (Fc) {
                delete w[V], va(L, Fc, -1);
              }
            }, "viii"), I = wa(function(L) {
              var G = ub(L, 1);
              try {
                var la = p(w[G]);
              } catch (V) {
                delete w[G];
                va(L, V, -1);
                return;
              }
              a(L, la);
              delete w[G];
            }, "vi");
            this.Sa[f] = J;
            this.Sa[l] = I;
            this.handleError(tb(this.db, f, r.length - 1, 1, 0, 0, J, I, 0));
            return this;
          };
          e.prototype.Zb = function(f) {
            this.Za && (vb(this.db, 0, 0), A(this.Za), this.Za = void 0);
            if (!f) return this;
            this.Za = wa(function(l, n, p, r, w) {
              switch (n) {
                case 18:
                  l = "insert";
                  break;
                case 23:
                  l = "update";
                  break;
                case 9:
                  l = "delete";
                  break;
                default:
                  throw "unknown operationCode in updateHook callback: " + n;
              }
              p = z(p);
              r = z(r);
              if (w > Number.MAX_SAFE_INTEGER) throw "rowId too big to fit inside a Number";
              f(l, p, r, Number(w));
            }, "viiiij");
            vb(this.db, this.Za, 0);
            return this;
          };
          c.prototype.bind = c.prototype.bind;
          c.prototype.step = c.prototype.step;
          c.prototype.get = c.prototype.get;
          c.prototype.getColumnNames = c.prototype.qb;
          c.prototype.getAsObject = c.prototype.zb;
          c.prototype.getSQL = c.prototype.Sb;
          c.prototype.getNormalizedSQL = c.prototype.Pb;
          c.prototype.run = c.prototype.run;
          c.prototype.reset = c.prototype.reset;
          c.prototype.freemem = c.prototype.freemem;
          c.prototype.free = c.prototype.Ya;
          d.prototype.next = d.prototype.next;
          d.prototype.getRemainingSQL = d.prototype.Qb;
          e.prototype.run = e.prototype.run;
          e.prototype.exec = e.prototype.exec;
          e.prototype.each = e.prototype.Mb;
          e.prototype.prepare = e.prototype.tb;
          e.prototype.iterateStatements = e.prototype.Ub;
          e.prototype["export"] = e.prototype.Nb;
          e.prototype.close = e.prototype.close;
          e.prototype.handleError = e.prototype.handleError;
          e.prototype.getRowsModified = e.prototype.Rb;
          e.prototype.create_function = e.prototype.Kb;
          e.prototype.create_aggregate = e.prototype.Jb;
          e.prototype.updateHook = e.prototype.Zb;
          k.Database = e;
        };
        var xa = "./this.program", ya = (a, b) => {
          throw b;
        }, za = globalThis.document?.currentScript?.src;
        "undefined" != typeof __filename ? za = __filename : ba && (za = self.location.href);
        var Aa = "", Ba, Ca;
        if (ca) {
          var fs7 = require("node:fs");
          Aa = __dirname + "/";
          Ca = (a) => {
            a = Da(a) ? new URL(a) : a;
            return fs7.readFileSync(a);
          };
          Ba = async (a) => {
            a = Da(a) ? new URL(a) : a;
            return fs7.readFileSync(a, void 0);
          };
          1 < process.argv.length && (xa = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          "undefined" != typeof module2 && (module2.exports = k);
          ya = (a, b) => {
            process.exitCode = a;
            throw b;
          };
        } else if (aa || ba) {
          try {
            Aa = new URL(".", za).href;
          } catch {
          }
          ba && (Ca = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          });
          Ba = async (a) => {
            if (Da(a)) return new Promise((c, d) => {
              var e = new XMLHttpRequest();
              e.open("GET", a, true);
              e.responseType = "arraybuffer";
              e.onload = () => {
                200 == e.status || 0 == e.status && e.response ? c(e.response) : d(e.status);
              };
              e.onerror = d;
              e.send(null);
            });
            var b = await fetch(a, { credentials: "same-origin" });
            if (b.ok) return b.arrayBuffer();
            throw Error(b.status + " : " + b.url);
          };
        }
        var Ea = console.log.bind(console), B = console.error.bind(console), Fa, Ga = false, Ha, Da = (a) => a.startsWith("file://"), m, C, Ia, E, F, Ja, Ka, H;
        function La() {
          var a = Ma.buffer;
          m = new Int8Array(a);
          Ia = new Int16Array(a);
          C = new Uint8Array(a);
          new Uint16Array(a);
          E = new Int32Array(a);
          F = new Uint32Array(a);
          Ja = new Float32Array(a);
          Ka = new Float64Array(a);
          H = new BigInt64Array(a);
          new BigUint64Array(a);
        }
        function Na(a) {
          k.onAbort?.(a);
          a = "Aborted(" + a + ")";
          B(a);
          Ga = true;
          throw new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
        }
        var Oa;
        async function Pa(a) {
          if (!Fa) try {
            var b = await Ba(a);
            return new Uint8Array(b);
          } catch {
          }
          if (a == Oa && Fa) a = new Uint8Array(Fa);
          else if (Ca) a = Ca(a);
          else throw "both async and sync fetching of the wasm failed";
          return a;
        }
        async function Qa(a, b) {
          try {
            var c = await Pa(a);
            return await WebAssembly.instantiate(c, b);
          } catch (d) {
            B(`failed to asynchronously prepare wasm: ${d}`), Na(d);
          }
        }
        async function Ra(a) {
          var b = Oa;
          if (!Fa && !Da(b) && !ca) try {
            var c = fetch(b, { credentials: "same-origin" });
            return await WebAssembly.instantiateStreaming(c, a);
          } catch (d) {
            B(`wasm streaming compile failed: ${d}`), B("falling back to ArrayBuffer instantiation");
          }
          return Qa(b, a);
        }
        class Sa {
          name = "ExitStatus";
          constructor(a) {
            this.message = `Program terminated with exit(${a})`;
            this.status = a;
          }
        }
        var Ta = (a) => {
          for (; 0 < a.length; ) a.shift()(k);
        }, Ua = [], Va = [], Wa = () => {
          var a = k.preRun.shift();
          Va.push(a);
        }, K = 0, Xa = null;
        function t(a, b = "i8") {
          b.endsWith("*") && (b = "*");
          switch (b) {
            case "i1":
              return m[a];
            case "i8":
              return m[a];
            case "i16":
              return Ia[a >> 1];
            case "i32":
              return E[a >> 2];
            case "i64":
              return H[a >> 3];
            case "float":
              return Ja[a >> 2];
            case "double":
              return Ka[a >> 3];
            case "*":
              return F[a >> 2];
            default:
              Na(`invalid type for getValue: ${b}`);
          }
        }
        var Ya = true;
        function ra(a) {
          var b = "i32";
          b.endsWith("*") && (b = "*");
          switch (b) {
            case "i1":
              m[a] = 0;
              break;
            case "i8":
              m[a] = 0;
              break;
            case "i16":
              Ia[a >> 1] = 0;
              break;
            case "i32":
              E[a >> 2] = 0;
              break;
            case "i64":
              H[a >> 3] = BigInt(0);
              break;
            case "float":
              Ja[a >> 2] = 0;
              break;
            case "double":
              Ka[a >> 3] = 0;
              break;
            case "*":
              F[a >> 2] = 0;
              break;
            default:
              Na(`invalid type for setValue: ${b}`);
          }
        }
        var Za = new TextDecoder(), $a = (a, b, c, d) => {
          c = b + c;
          if (d) return c;
          for (; a[b] && !(b >= c); ) ++b;
          return b;
        }, z = (a, b, c) => a ? Za.decode(C.subarray(a, $a(C, a, b, c))) : "", ab = (a, b) => {
          for (var c = 0, d = a.length - 1; 0 <= d; d--) {
            var e = a[d];
            "." === e ? a.splice(d, 1) : ".." === e ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
          }
          if (b) for (; c; c--) a.unshift("..");
          return a;
        }, ia = (a) => {
          var b = "/" === a.charAt(0), c = "/" === a.slice(-1);
          (a = ab(a.split("/").filter((d) => !!d), !b).join("/")) || b || (a = ".");
          a && c && (a += "/");
          return (b ? "/" : "") + a;
        }, bb = (a) => {
          var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
          a = b[0];
          b = b[1];
          if (!a && !b) return ".";
          b &&= b.slice(0, -1);
          return a + b;
        }, cb = (a) => a && a.match(/([^\/]+|\/)\/*$/)[1], db = () => {
          if (ca) {
            var a = require("node:crypto");
            return (b) => a.randomFillSync(b);
          }
          return (b) => crypto.getRandomValues(b);
        }, eb = (a) => {
          (eb = db())(a);
        }, fb = (...a) => {
          for (var b = "", c = false, d = a.length - 1; -1 <= d && !c; d--) {
            c = 0 <= d ? a[d] : "/";
            if ("string" != typeof c) throw new TypeError("Arguments to path.resolve must be strings");
            if (!c) return "";
            b = c + "/" + b;
            c = "/" === c.charAt(0);
          }
          b = ab(b.split("/").filter((e) => !!e), !c).join("/");
          return (c ? "/" : "") + b || ".";
        }, gb = (a) => {
          var b = $a(a, 0);
          return Za.decode(a.buffer ? a.subarray(0, b) : new Uint8Array(a.slice(0, b)));
        }, hb = [], ib = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, M = (a, b, c, d) => {
          if (!(0 < d)) return 0;
          var e = c;
          d = c + d - 1;
          for (var g = 0; g < a.length; ++g) {
            var h = a.codePointAt(g);
            if (127 >= h) {
              if (c >= d) break;
              b[c++] = h;
            } else if (2047 >= h) {
              if (c + 1 >= d) break;
              b[c++] = 192 | h >> 6;
              b[c++] = 128 | h & 63;
            } else if (65535 >= h) {
              if (c + 2 >= d) break;
              b[c++] = 224 | h >> 12;
              b[c++] = 128 | h >> 6 & 63;
              b[c++] = 128 | h & 63;
            } else {
              if (c + 3 >= d) break;
              b[c++] = 240 | h >> 18;
              b[c++] = 128 | h >> 12 & 63;
              b[c++] = 128 | h >> 6 & 63;
              b[c++] = 128 | h & 63;
              g++;
            }
          }
          b[c] = 0;
          return c - e;
        }, jb = [];
        function kb(a, b) {
          jb[a] = { input: [], output: [], eb: b };
          mb(a, nb);
        }
        var nb = { open(a) {
          var b = jb[a.node.rdev];
          if (!b) throw new N(43);
          a.tty = b;
          a.seekable = false;
        }, close(a) {
          a.tty.eb.fsync(a.tty);
        }, fsync(a) {
          a.tty.eb.fsync(a.tty);
        }, read(a, b, c, d) {
          if (!a.tty || !a.tty.eb.Bb) throw new N(60);
          for (var e = 0, g = 0; g < d; g++) {
            try {
              var h = a.tty.eb.Bb(a.tty);
            } catch (q) {
              throw new N(29);
            }
            if (void 0 === h && 0 === e) throw new N(6);
            if (null === h || void 0 === h) break;
            e++;
            b[c + g] = h;
          }
          e && (a.node.atime = Date.now());
          return e;
        }, write(a, b, c, d) {
          if (!a.tty || !a.tty.eb.ub) throw new N(60);
          try {
            for (var e = 0; e < d; e++) a.tty.eb.ub(a.tty, b[c + e]);
          } catch (g) {
            throw new N(29);
          }
          d && (a.node.mtime = a.node.ctime = Date.now());
          return e;
        } }, wb = { Bb() {
          a: {
            if (!hb.length) {
              var a = null;
              if (ca) {
                var b = Buffer.alloc(256), c = 0, d = process.stdin.fd;
                try {
                  c = fs7.readSync(d, b, 0, 256);
                } catch (e) {
                  if (e.toString().includes("EOF")) c = 0;
                  else throw e;
                }
                0 < c && (a = b.slice(0, c).toString("utf-8"));
              } else globalThis.window?.prompt && (a = window.prompt("Input: "), null !== a && (a += "\n"));
              if (!a) {
                a = null;
                break a;
              }
              b = Array(ib(a) + 1);
              a = M(a, b, 0, b.length);
              b.length = a;
              hb = b;
            }
            a = hb.shift();
          }
          return a;
        }, ub(a, b) {
          null === b || 10 === b ? (Ea(gb(a.output)), a.output = []) : 0 != b && a.output.push(b);
        }, fsync(a) {
          0 < a.output?.length && (Ea(gb(a.output)), a.output = []);
        }, hc() {
          return { bc: 25856, dc: 5, ac: 191, cc: 35387, $b: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
        }, ic() {
          return 0;
        }, jc() {
          return [24, 80];
        } }, xb = { ub(a, b) {
          null === b || 10 === b ? (B(gb(a.output)), a.output = []) : 0 != b && a.output.push(b);
        }, fsync(a) {
          0 < a.output?.length && (B(gb(a.output)), a.output = []);
        } }, O = { Wa: null, Xa() {
          return O.createNode(null, "/", 16895, 0);
        }, createNode(a, b, c, d) {
          if (24576 === (c & 61440) || 4096 === (c & 61440)) throw new N(63);
          O.Wa || (O.Wa = { dir: { node: { Ta: O.La.Ta, Ua: O.La.Ua, lookup: O.La.lookup, ib: O.La.ib, rename: O.La.rename, unlink: O.La.unlink, rmdir: O.La.rmdir, readdir: O.La.readdir, symlink: O.La.symlink }, stream: { Va: O.Ma.Va } }, file: { node: { Ta: O.La.Ta, Ua: O.La.Ua }, stream: { Va: O.Ma.Va, read: O.Ma.read, write: O.Ma.write, jb: O.Ma.jb, kb: O.Ma.kb } }, link: { node: { Ta: O.La.Ta, Ua: O.La.Ua, readlink: O.La.readlink }, stream: {} }, yb: { node: { Ta: O.La.Ta, Ua: O.La.Ua }, stream: yb } });
          c = zb(a, b, c, d);
          P(c.mode) ? (c.La = O.Wa.dir.node, c.Ma = O.Wa.dir.stream, c.Na = {}) : 32768 === (c.mode & 61440) ? (c.La = O.Wa.file.node, c.Ma = O.Wa.file.stream, c.Ra = 0, c.Na = null) : 40960 === (c.mode & 61440) ? (c.La = O.Wa.link.node, c.Ma = O.Wa.link.stream) : 8192 === (c.mode & 61440) && (c.La = O.Wa.yb.node, c.Ma = O.Wa.yb.stream);
          c.atime = c.mtime = c.ctime = Date.now();
          a && (a.Na[b] = c, a.atime = a.mtime = a.ctime = c.atime);
          return c;
        }, fc(a) {
          return a.Na ? a.Na.subarray ? a.Na.subarray(0, a.Ra) : new Uint8Array(a.Na) : new Uint8Array(0);
        }, La: {
          Ta(a) {
            var b = {};
            b.dev = 8192 === (a.mode & 61440) ? a.id : 1;
            b.ino = a.id;
            b.mode = a.mode;
            b.nlink = 1;
            b.uid = 0;
            b.gid = 0;
            b.rdev = a.rdev;
            P(a.mode) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.Ra : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
            b.atime = new Date(a.atime);
            b.mtime = new Date(a.mtime);
            b.ctime = new Date(a.ctime);
            b.blksize = 4096;
            b.blocks = Math.ceil(b.size / b.blksize);
            return b;
          },
          Ua(a, b) {
            for (var c of ["mode", "atime", "mtime", "ctime"]) null != b[c] && (a[c] = b[c]);
            void 0 !== b.size && (b = b.size, a.Ra != b && (0 == b ? (a.Na = null, a.Ra = 0) : (c = a.Na, a.Na = new Uint8Array(b), c && a.Na.set(c.subarray(0, Math.min(b, a.Ra))), a.Ra = b)));
          },
          lookup() {
            O.nb || (O.nb = new N(44), O.nb.stack = "<generic error, no stack>");
            throw O.nb;
          },
          ib(a, b, c, d) {
            return O.createNode(a, b, c, d);
          },
          rename(a, b, c) {
            try {
              var d = Q(b, c);
            } catch (g) {
            }
            if (d) {
              if (P(a.mode)) for (var e in d.Na) throw new N(55);
              Ab(d);
            }
            delete a.parent.Na[a.name];
            b.Na[c] = a;
            a.name = c;
            b.ctime = b.mtime = a.parent.ctime = a.parent.mtime = Date.now();
          },
          unlink(a, b) {
            delete a.Na[b];
            a.ctime = a.mtime = Date.now();
          },
          rmdir(a, b) {
            var c = Q(a, b), d;
            for (d in c.Na) throw new N(55);
            delete a.Na[b];
            a.ctime = a.mtime = Date.now();
          },
          readdir(a) {
            return [".", "..", ...Object.keys(a.Na)];
          },
          symlink(a, b, c) {
            a = O.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          },
          readlink(a) {
            if (40960 !== (a.mode & 61440)) throw new N(28);
            return a.link;
          }
        }, Ma: { read(a, b, c, d, e) {
          var g = a.node.Na;
          if (e >= a.node.Ra) return 0;
          a = Math.min(a.node.Ra - e, d);
          if (8 < a && g.subarray) b.set(g.subarray(e, e + a), c);
          else for (d = 0; d < a; d++) b[c + d] = g[e + d];
          return a;
        }, write(a, b, c, d, e, g) {
          b.buffer === m.buffer && (g = false);
          if (!d) return 0;
          a = a.node;
          a.mtime = a.ctime = Date.now();
          if (b.subarray && (!a.Na || a.Na.subarray)) {
            if (g) return a.Na = b.subarray(c, c + d), a.Ra = d;
            if (0 === a.Ra && 0 === e) return a.Na = b.slice(c, c + d), a.Ra = d;
            if (e + d <= a.Ra) return a.Na.set(b.subarray(c, c + d), e), d;
          }
          g = e + d;
          var h = a.Na ? a.Na.length : 0;
          h >= g || (g = Math.max(g, h * (1048576 > h ? 2 : 1.125) >>> 0), 0 != h && (g = Math.max(g, 256)), h = a.Na, a.Na = new Uint8Array(g), 0 < a.Ra && a.Na.set(h.subarray(0, a.Ra), 0));
          if (a.Na.subarray && b.subarray) a.Na.set(b.subarray(c, c + d), e);
          else for (g = 0; g < d; g++) a.Na[e + g] = b[c + g];
          a.Ra = Math.max(a.Ra, e + d);
          return d;
        }, Va(a, b, c) {
          1 === c ? b += a.position : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.Ra);
          if (0 > b) throw new N(28);
          return b;
        }, jb(a, b, c, d, e) {
          if (32768 !== (a.node.mode & 61440)) throw new N(43);
          a = a.node.Na;
          if (e & 2 || !a || a.buffer !== m.buffer) {
            e = true;
            d = 65536 * Math.ceil(b / 65536);
            var g = Bb(65536, d);
            g && C.fill(0, g, g + d);
            d = g;
            if (!d) throw new N(48);
            if (a) {
              if (0 < c || c + b < a.length) a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
              m.set(a, d);
            }
          } else e = false, d = a.byteOffset;
          return { Xb: d, Eb: e };
        }, kb(a, b, c, d) {
          O.Ma.write(a, b, 0, d, c, false);
          return 0;
        } } }, ja = (a, b) => {
          var c = 0;
          a && (c |= 365);
          b && (c |= 146);
          return c;
        }, Cb = null, Db = {}, Eb = [], Fb = 1, R = null, Gb = false, Hb = true, Ib = {}, N = class {
          name = "ErrnoError";
          constructor(a) {
            this.Pa = a;
          }
        }, Jb = class {
          hb = {};
          node = null;
          get flags() {
            return this.hb.flags;
          }
          set flags(a) {
            this.hb.flags = a;
          }
          get position() {
            return this.hb.position;
          }
          set position(a) {
            this.hb.position = a;
          }
        }, Kb = class {
          La = {};
          Ma = {};
          bb = null;
          constructor(a, b, c, d) {
            a ||= this;
            this.parent = a;
            this.Xa = a.Xa;
            this.id = Fb++;
            this.name = b;
            this.mode = c;
            this.rdev = d;
            this.atime = this.mtime = this.ctime = Date.now();
          }
          get read() {
            return 365 === (this.mode & 365);
          }
          set read(a) {
            a ? this.mode |= 365 : this.mode &= -366;
          }
          get write() {
            return 146 === (this.mode & 146);
          }
          set write(a) {
            a ? this.mode |= 146 : this.mode &= -147;
          }
        };
        function S(a, b = {}) {
          if (!a) throw new N(44);
          b.pb ?? (b.pb = true);
          "/" === a.charAt(0) || (a = "//" + a);
          var c = 0;
          a: for (; 40 > c; c++) {
            a = a.split("/").filter((q) => !!q);
            for (var d = Cb, e = "/", g = 0; g < a.length; g++) {
              var h = g === a.length - 1;
              if (h && b.parent) break;
              if ("." !== a[g]) if (".." === a[g]) if (e = bb(e), d === d.parent) {
                a = e + "/" + a.slice(g + 1).join("/");
                c--;
                continue a;
              } else d = d.parent;
              else {
                e = ia(e + "/" + a[g]);
                try {
                  d = Q(d, a[g]);
                } catch (q) {
                  if (44 === q?.Pa && h && b.Wb) return { path: e };
                  throw q;
                }
                !d.bb || h && !b.pb || (d = d.bb.root);
                if (40960 === (d.mode & 61440) && (!h || b.ab)) {
                  if (!d.La.readlink) throw new N(52);
                  d = d.La.readlink(d);
                  "/" === d.charAt(0) || (d = bb(e) + "/" + d);
                  a = d + "/" + a.slice(g + 1).join("/");
                  continue a;
                }
              }
            }
            return { path: e, node: d };
          }
          throw new N(32);
        }
        function ha(a) {
          for (var b; ; ) {
            if (a === a.parent) return a = a.Xa.Db, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
            b = b ? `${a.name}/${b}` : a.name;
            a = a.parent;
          }
        }
        function Lb(a, b) {
          for (var c = 0, d = 0; d < b.length; d++) c = (c << 5) - c + b.charCodeAt(d) | 0;
          return (a + c >>> 0) % R.length;
        }
        function Ab(a) {
          var b = Lb(a.parent.id, a.name);
          if (R[b] === a) R[b] = a.cb;
          else for (b = R[b]; b; ) {
            if (b.cb === a) {
              b.cb = a.cb;
              break;
            }
            b = b.cb;
          }
        }
        function Q(a, b) {
          var c = P(a.mode) ? (c = Mb(a, "x")) ? c : a.La.lookup ? 0 : 2 : 54;
          if (c) throw new N(c);
          for (c = R[Lb(a.id, b)]; c; c = c.cb) {
            var d = c.name;
            if (c.parent.id === a.id && d === b) return c;
          }
          return a.La.lookup(a, b);
        }
        function zb(a, b, c, d) {
          a = new Kb(a, b, c, d);
          b = Lb(a.parent.id, a.name);
          a.cb = R[b];
          return R[b] = a;
        }
        function P(a) {
          return 16384 === (a & 61440);
        }
        function Nb(a) {
          var b = ["r", "w", "rw"][a & 3];
          a & 512 && (b += "w");
          return b;
        }
        function Mb(a, b) {
          if (Hb) return 0;
          if (!b.includes("r") || a.mode & 292) {
            if (b.includes("w") && !(a.mode & 146) || b.includes("x") && !(a.mode & 73)) return 2;
          } else return 2;
          return 0;
        }
        function Ob(a, b) {
          if (!P(a.mode)) return 54;
          try {
            return Q(a, b), 20;
          } catch (c) {
          }
          return Mb(a, "wx");
        }
        function Pb(a, b, c) {
          try {
            var d = Q(a, b);
          } catch (e) {
            return e.Pa;
          }
          if (a = Mb(a, "wx")) return a;
          if (c) {
            if (!P(d.mode)) return 54;
            if (d === d.parent || "/" === ha(d)) return 10;
          } else if (P(d.mode)) return 31;
          return 0;
        }
        function Qb(a) {
          if (!a) throw new N(63);
          return a;
        }
        function T(a) {
          a = Eb[a];
          if (!a) throw new N(8);
          return a;
        }
        function Rb(a, b = -1) {
          a = Object.assign(new Jb(), a);
          if (-1 == b) a: {
            for (b = 0; 4096 >= b; b++) if (!Eb[b]) break a;
            throw new N(33);
          }
          a.fd = b;
          return Eb[b] = a;
        }
        function Sb(a, b = -1) {
          a = Rb(a, b);
          a.Ma?.ec?.(a);
          return a;
        }
        function Tb(a, b, c) {
          var d = a?.Ma.Ua;
          a = d ? a : b;
          d ??= b.La.Ua;
          Qb(d);
          d(a, c);
        }
        var yb = { open(a) {
          a.Ma = Db[a.node.rdev].Ma;
          a.Ma.open?.(a);
        }, Va() {
          throw new N(70);
        } };
        function mb(a, b) {
          Db[a] = { Ma: b };
        }
        function Ub(a, b) {
          var c = "/" === b;
          if (c && Cb) throw new N(10);
          if (!c && b) {
            var d = S(b, { pb: false });
            b = d.path;
            d = d.node;
            if (d.bb) throw new N(10);
            if (!P(d.mode)) throw new N(54);
          }
          b = { type: a, kc: {}, Db: b, Vb: [] };
          a = a.Xa(b);
          a.Xa = b;
          b.root = a;
          c ? Cb = a : d && (d.bb = b, d.Xa && d.Xa.Vb.push(b));
        }
        function Vb(a, b, c) {
          var d = S(a, { parent: true }).node;
          a = cb(a);
          if (!a) throw new N(28);
          if ("." === a || ".." === a) throw new N(20);
          var e = Ob(d, a);
          if (e) throw new N(e);
          if (!d.La.ib) throw new N(63);
          return d.La.ib(d, a, b, c);
        }
        function ka(a, b = 438) {
          return Vb(a, b & 4095 | 32768, 0);
        }
        function U(a, b = 511) {
          return Vb(a, b & 1023 | 16384, 0);
        }
        function Wb(a, b, c) {
          "undefined" == typeof c && (c = b, b = 438);
          Vb(a, b | 8192, c);
        }
        function Xb(a, b) {
          if (!fb(a)) throw new N(44);
          var c = S(b, { parent: true }).node;
          if (!c) throw new N(44);
          b = cb(b);
          var d = Ob(c, b);
          if (d) throw new N(d);
          if (!c.La.symlink) throw new N(63);
          c.La.symlink(c, b, a);
        }
        function Yb(a) {
          var b = S(a, { parent: true }).node;
          a = cb(a);
          var c = Q(b, a), d = Pb(b, a, true);
          if (d) throw new N(d);
          if (!b.La.rmdir) throw new N(63);
          if (c.bb) throw new N(10);
          b.La.rmdir(b, a);
          Ab(c);
        }
        function ua(a) {
          var b = S(a, { parent: true }).node;
          if (!b) throw new N(44);
          a = cb(a);
          var c = Q(b, a), d = Pb(b, a, false);
          if (d) throw new N(d);
          if (!b.La.unlink) throw new N(63);
          if (c.bb) throw new N(10);
          b.La.unlink(b, a);
          Ab(c);
        }
        function Zb(a, b) {
          a = S(a, { ab: !b }).node;
          return Qb(a.La.Ta)(a);
        }
        function $b(a, b, c, d) {
          Tb(a, b, { mode: c & 4095 | b.mode & -4096, ctime: Date.now(), Lb: d });
        }
        function ma(a, b) {
          a = "string" == typeof a ? S(a, { ab: true }).node : a;
          $b(null, a, b);
        }
        function ac(a, b, c) {
          if (P(b.mode)) throw new N(31);
          if (32768 !== (b.mode & 61440)) throw new N(28);
          var d = Mb(b, "w");
          if (d) throw new N(d);
          Tb(a, b, { size: c, timestamp: Date.now() });
        }
        function na(a, b, c = 438) {
          if ("" === a) throw new N(44);
          if ("string" == typeof b) {
            var d = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[b];
            if ("undefined" == typeof d) throw Error(`Unknown file open mode: ${b}`);
            b = d;
          }
          c = b & 64 ? c & 4095 | 32768 : 0;
          if ("object" == typeof a) d = a;
          else {
            var e = a.endsWith("/");
            a = S(a, { ab: !(b & 131072), Wb: true });
            d = a.node;
            a = a.path;
          }
          var g = false;
          if (b & 64) if (d) {
            if (b & 128) throw new N(20);
          } else {
            if (e) throw new N(31);
            d = Vb(a, c | 511, 0);
            g = true;
          }
          if (!d) throw new N(44);
          8192 === (d.mode & 61440) && (b &= -513);
          if (b & 65536 && !P(d.mode)) throw new N(54);
          if (!g && (e = d ? 40960 === (d.mode & 61440) ? 32 : P(d.mode) && ("r" !== Nb(b) || b & 576) ? 31 : Mb(d, Nb(b)) : 44)) throw new N(e);
          b & 512 && !g && (e = d, e = "string" == typeof e ? S(e, { ab: true }).node : e, ac(null, e, 0));
          b &= -131713;
          e = Rb({ node: d, path: ha(d), flags: b, seekable: true, position: 0, Ma: d.Ma, Yb: [], error: false });
          e.Ma.open && e.Ma.open(e);
          g && ma(d, c & 511);
          !k.logReadFiles || b & 1 || a in Ib || (Ib[a] = 1);
          return e;
        }
        function pa(a) {
          if (null === a.fd) throw new N(8);
          a.rb && (a.rb = null);
          try {
            a.Ma.close && a.Ma.close(a);
          } catch (b) {
            throw b;
          } finally {
            Eb[a.fd] = null;
          }
          a.fd = null;
        }
        function bc(a, b, c) {
          if (null === a.fd) throw new N(8);
          if (!a.seekable || !a.Ma.Va) throw new N(70);
          if (0 != c && 1 != c && 2 != c) throw new N(28);
          a.position = a.Ma.Va(a, b, c);
          a.Yb = [];
        }
        function cc(a, b, c, d, e) {
          if (0 > d || 0 > e) throw new N(28);
          if (null === a.fd) throw new N(8);
          if (1 === (a.flags & 2097155)) throw new N(8);
          if (P(a.node.mode)) throw new N(31);
          if (!a.Ma.read) throw new N(28);
          var g = "undefined" != typeof e;
          if (!g) e = a.position;
          else if (!a.seekable) throw new N(70);
          b = a.Ma.read(a, b, c, d, e);
          g || (a.position += b);
          return b;
        }
        function oa(a, b, c, d, e) {
          if (0 > d || 0 > e) throw new N(28);
          if (null === a.fd) throw new N(8);
          if (0 === (a.flags & 2097155)) throw new N(8);
          if (P(a.node.mode)) throw new N(31);
          if (!a.Ma.write) throw new N(28);
          a.seekable && a.flags & 1024 && bc(a, 0, 2);
          var g = "undefined" != typeof e;
          if (!g) e = a.position;
          else if (!a.seekable) throw new N(70);
          b = a.Ma.write(a, b, c, d, e, void 0);
          g || (a.position += b);
          return b;
        }
        function ta(a) {
          var b = b || 0;
          var c = "binary";
          "utf8" !== c && "binary" !== c && Na(`Invalid encoding type "${c}"`);
          b = na(a, b);
          a = Zb(a).size;
          var d = new Uint8Array(a);
          cc(b, d, 0, a, 0);
          "utf8" === c && (d = gb(d));
          pa(b);
          return d;
        }
        function W(a, b, c) {
          a = ia("/dev/" + a);
          var d = ja(!!b, !!c);
          W.Cb ?? (W.Cb = 64);
          var e = W.Cb++ << 8 | 0;
          mb(e, { open(g) {
            g.seekable = false;
          }, close() {
            c?.buffer?.length && c(10);
          }, read(g, h, q, v) {
            for (var u = 0, x = 0; x < v; x++) {
              try {
                var D = b();
              } catch (pb) {
                throw new N(29);
              }
              if (void 0 === D && 0 === u) throw new N(6);
              if (null === D || void 0 === D) break;
              u++;
              h[q + x] = D;
            }
            u && (g.node.atime = Date.now());
            return u;
          }, write(g, h, q, v) {
            for (var u = 0; u < v; u++) try {
              c(h[q + u]);
            } catch (x) {
              throw new N(29);
            }
            v && (g.node.mtime = g.node.ctime = Date.now());
            return u;
          } });
          Wb(a, d, e);
        }
        var X = {};
        function Y(a, b, c) {
          if ("/" === b.charAt(0)) return b;
          a = -100 === a ? "/" : T(a).path;
          if (0 == b.length) {
            if (!c) throw new N(44);
            return a;
          }
          return a + "/" + b;
        }
        function mc(a, b) {
          F[a >> 2] = b.dev;
          F[a + 4 >> 2] = b.mode;
          F[a + 8 >> 2] = b.nlink;
          F[a + 12 >> 2] = b.uid;
          F[a + 16 >> 2] = b.gid;
          F[a + 20 >> 2] = b.rdev;
          H[a + 24 >> 3] = BigInt(b.size);
          E[a + 32 >> 2] = 4096;
          E[a + 36 >> 2] = b.blocks;
          var c = b.atime.getTime(), d = b.mtime.getTime(), e = b.ctime.getTime();
          H[a + 40 >> 3] = BigInt(Math.floor(c / 1e3));
          F[a + 48 >> 2] = c % 1e3 * 1e6;
          H[a + 56 >> 3] = BigInt(Math.floor(d / 1e3));
          F[a + 64 >> 2] = d % 1e3 * 1e6;
          H[a + 72 >> 3] = BigInt(Math.floor(e / 1e3));
          F[a + 80 >> 2] = e % 1e3 * 1e6;
          H[a + 88 >> 3] = BigInt(b.ino);
          return 0;
        }
        var Ec = void 0, Gc = () => {
          var a = E[+Ec >> 2];
          Ec += 4;
          return a;
        }, Hc = 0, Ic = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Jc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Kc = {}, Lc = (a) => {
          Ha = a;
          Ya || 0 < Hc || (k.onExit?.(a), Ga = true);
          ya(a, new Sa(a));
        }, Mc = (a) => {
          if (!Ga) try {
            a();
          } catch (b) {
            b instanceof Sa || "unwind" == b || ya(1, b);
          } finally {
            if (!(Ya || 0 < Hc)) try {
              Ha = a = Ha, Lc(a);
            } catch (b) {
              b instanceof Sa || "unwind" == b || ya(1, b);
            }
          }
        }, Nc = {}, Pc = () => {
          if (!Oc) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (globalThis.navigator?.language ?? "C").replace("-", "_") + ".UTF-8", _: xa || "./this.program" }, b;
            for (b in Nc) void 0 === Nc[b] ? delete a[b] : a[b] = Nc[b];
            var c = [];
            for (b in a) c.push(`${b}=${a[b]}`);
            Oc = c;
          }
          return Oc;
        }, Oc, Qc = (a, b, c, d) => {
          var e = { string: (u) => {
            var x = 0;
            if (null !== u && void 0 !== u && 0 !== u) {
              x = ib(u) + 1;
              var D = y(x);
              M(u, C, D, x);
              x = D;
            }
            return x;
          }, array: (u) => {
            var x = y(u.length);
            m.set(u, x);
            return x;
          } };
          a = k["_" + a];
          var g = [], h = 0;
          if (d) for (var q = 0; q < d.length; q++) {
            var v = e[c[q]];
            v ? (0 === h && (h = qa()), g[q] = v(d[q])) : g[q] = d[q];
          }
          c = a(...g);
          return c = function(u) {
            0 !== h && sa(h);
            return "string" === b ? z(u) : "boolean" === b ? !!u : u;
          }(c);
        }, fa = (a) => {
          var b = ib(a) + 1, c = da(b);
          c && M(a, C, c, b);
          return c;
        }, Rc, Sc = [], A = (a) => {
          Rc.delete(Z.get(a));
          Z.set(a, null);
          Sc.push(a);
        }, Tc = (a) => {
          const b = a.length;
          return [b % 128 | 128, b >> 7, ...a];
        }, Uc = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 }, Vc = (a) => Tc(Array.from(a, (b) => Uc[b])), wa = (a, b) => {
          if (!Rc) {
            Rc = /* @__PURE__ */ new WeakMap();
            var c = Z.length;
            if (Rc) for (var d = 0; d < 0 + c; d++) {
              var e = Z.get(d);
              e && Rc.set(e, d);
            }
          }
          if (c = Rc.get(a) || 0) return c;
          c = Sc.length ? Sc.pop() : Z.grow(1);
          try {
            Z.set(c, a);
          } catch (g) {
            if (!(g instanceof TypeError)) throw g;
            b = Uint8Array.of(0, 97, 115, 109, 1, 0, 0, 0, 1, ...Tc([1, 96, ...Vc(b.slice(1)), ...Vc("v" === b[0] ? "" : b[0])]), 2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
            b = new WebAssembly.Module(b);
            b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;
            Z.set(c, b);
          }
          Rc.set(a, c);
          return c;
        };
        R = Array(4096);
        Ub(O, "/");
        U("/tmp");
        U("/home");
        U("/home/web_user");
        (function() {
          U("/dev");
          mb(259, { read: () => 0, write: (d, e, g, h) => h, Va: () => 0 });
          Wb("/dev/null", 259);
          kb(1280, wb);
          kb(1536, xb);
          Wb("/dev/tty", 1280);
          Wb("/dev/tty1", 1536);
          var a = new Uint8Array(1024), b = 0, c = () => {
            0 === b && (eb(a), b = a.byteLength);
            return a[--b];
          };
          W("random", c);
          W("urandom", c);
          U("/dev/shm");
          U("/dev/shm/tmp");
        })();
        (function() {
          U("/proc");
          var a = U("/proc/self");
          U("/proc/self/fd");
          Ub({ Xa() {
            var b = zb(a, "fd", 16895, 73);
            b.Ma = { Va: O.Ma.Va };
            b.La = { lookup(c, d) {
              c = +d;
              var e = T(c);
              c = { parent: null, Xa: { Db: "fake" }, La: { readlink: () => e.path }, id: c + 1 };
              return c.parent = c;
            }, readdir() {
              return Array.from(Eb.entries()).filter(([, c]) => c).map(([c]) => c.toString());
            } };
            return b;
          } }, "/proc/self/fd");
        })();
        k.noExitRuntime && (Ya = k.noExitRuntime);
        k.print && (Ea = k.print);
        k.printErr && (B = k.printErr);
        k.wasmBinary && (Fa = k.wasmBinary);
        k.thisProgram && (xa = k.thisProgram);
        if (k.preInit) for ("function" == typeof k.preInit && (k.preInit = [k.preInit]); 0 < k.preInit.length; ) k.preInit.shift()();
        k.stackSave = () => qa();
        k.stackRestore = (a) => sa(a);
        k.stackAlloc = (a) => y(a);
        k.cwrap = (a, b, c, d) => {
          var e = !c || c.every((g) => "number" === g || "boolean" === g);
          return "string" !== b && e && !d ? k["_" + a] : (...g) => Qc(a, b, c, g);
        };
        k.addFunction = wa;
        k.removeFunction = A;
        k.UTF8ToString = z;
        k.stringToNewUTF8 = fa;
        k.writeArrayToMemory = (a, b) => {
          m.set(a, b);
        };
        var da, ea, Bb, Wc, sa, y, qa, Ma, Z, Xc = {
          a: (a, b, c, d) => Na(`Assertion failed: ${z(a)}, at: ` + [b ? z(b) : "unknown filename", c, d ? z(d) : "unknown function"]),
          i: function(a, b) {
            try {
              return a = z(a), ma(a, b), 0;
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          },
          L: function(a, b, c) {
            try {
              b = z(b);
              b = Y(a, b);
              if (c & -8) return -28;
              var d = S(b, { ab: true }).node;
              if (!d) return -44;
              a = "";
              c & 4 && (a += "r");
              c & 2 && (a += "w");
              c & 1 && (a += "x");
              return a && Mb(d, a) ? -2 : 0;
            } catch (e) {
              if ("undefined" == typeof X || "ErrnoError" !== e.name) throw e;
              return -e.Pa;
            }
          },
          j: function(a, b) {
            try {
              var c = T(a);
              $b(c, c.node, b, false);
              return 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          h: function(a) {
            try {
              var b = T(a);
              Tb(b, b.node, { timestamp: Date.now(), Lb: false });
              return 0;
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          },
          b: function(a, b, c) {
            Ec = c;
            try {
              var d = T(a);
              switch (b) {
                case 0:
                  var e = Gc();
                  if (0 > e) break;
                  for (; Eb[e]; ) e++;
                  return Sb(d, e).fd;
                case 1:
                case 2:
                  return 0;
                case 3:
                  return d.flags;
                case 4:
                  return e = Gc(), d.flags |= e, 0;
                case 12:
                  return e = Gc(), Ia[e + 0 >> 1] = 2, 0;
                case 13:
                case 14:
                  return 0;
              }
              return -28;
            } catch (g) {
              if ("undefined" == typeof X || "ErrnoError" !== g.name) throw g;
              return -g.Pa;
            }
          },
          g: function(a, b) {
            try {
              var c = T(a), d = c.node, e = c.Ma.Ta;
              a = e ? c : d;
              e ??= d.La.Ta;
              Qb(e);
              var g = e(a);
              return mc(b, g);
            } catch (h) {
              if ("undefined" == typeof X || "ErrnoError" !== h.name) throw h;
              return -h.Pa;
            }
          },
          H: function(a, b) {
            b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
            try {
              if (isNaN(b)) return -61;
              var c = T(a);
              if (0 > b || 0 === (c.flags & 2097155)) throw new N(28);
              ac(c, c.node, b);
              return 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          G: function(a, b) {
            try {
              if (0 === b) return -28;
              var c = ib("/") + 1;
              if (b < c) return -68;
              M("/", C, a, b);
              return c;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          K: function(a, b) {
            try {
              return a = z(a), mc(b, Zb(a, true));
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          },
          C: function(a, b, c) {
            try {
              return b = z(b), b = Y(a, b), U(b, c), 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          J: function(a, b, c, d) {
            try {
              b = z(b);
              var e = d & 256;
              b = Y(a, b, d & 4096);
              return mc(c, e ? Zb(b, true) : Zb(b));
            } catch (g) {
              if ("undefined" == typeof X || "ErrnoError" !== g.name) throw g;
              return -g.Pa;
            }
          },
          x: function(a, b, c, d) {
            Ec = d;
            try {
              b = z(b);
              b = Y(a, b);
              var e = d ? Gc() : 0;
              return na(b, c, e).fd;
            } catch (g) {
              if ("undefined" == typeof X || "ErrnoError" !== g.name) throw g;
              return -g.Pa;
            }
          },
          v: function(a, b, c, d) {
            try {
              b = z(b);
              b = Y(a, b);
              if (0 >= d) return -28;
              var e = S(b).node;
              if (!e) throw new N(44);
              if (!e.La.readlink) throw new N(28);
              var g = e.La.readlink(e);
              var h = Math.min(d, ib(g)), q = m[c + h];
              M(
                g,
                C,
                c,
                d + 1
              );
              m[c + h] = q;
              return h;
            } catch (v) {
              if ("undefined" == typeof X || "ErrnoError" !== v.name) throw v;
              return -v.Pa;
            }
          },
          u: function(a) {
            try {
              return a = z(a), Yb(a), 0;
            } catch (b) {
              if ("undefined" == typeof X || "ErrnoError" !== b.name) throw b;
              return -b.Pa;
            }
          },
          f: function(a, b) {
            try {
              return a = z(a), mc(b, Zb(a));
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          },
          r: function(a, b, c) {
            try {
              b = z(b);
              b = Y(a, b);
              if (c) if (512 === c) Yb(b);
              else return -28;
              else ua(b);
              return 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          q: function(a, b, c) {
            try {
              b = z(b);
              b = Y(a, b, true);
              var d = Date.now(), e, g;
              if (c) {
                var h = F[c >> 2] + 4294967296 * E[c + 4 >> 2], q = E[c + 8 >> 2];
                1073741823 == q ? e = d : 1073741822 == q ? e = null : e = 1e3 * h + q / 1e6;
                c += 16;
                h = F[c >> 2] + 4294967296 * E[c + 4 >> 2];
                q = E[c + 8 >> 2];
                1073741823 == q ? g = d : 1073741822 == q ? g = null : g = 1e3 * h + q / 1e6;
              } else g = e = d;
              if (null !== (g ?? e)) {
                a = e;
                var v = S(b, { ab: true }).node;
                Qb(v.La.Ua)(v, { atime: a, mtime: g });
              }
              return 0;
            } catch (u) {
              if ("undefined" == typeof X || "ErrnoError" !== u.name) throw u;
              return -u.Pa;
            }
          },
          m: () => Na(""),
          l: () => {
            Ya = false;
            Hc = 0;
          },
          A: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            a = new Date(1e3 * a);
            E[b >> 2] = a.getSeconds();
            E[b + 4 >> 2] = a.getMinutes();
            E[b + 8 >> 2] = a.getHours();
            E[b + 12 >> 2] = a.getDate();
            E[b + 16 >> 2] = a.getMonth();
            E[b + 20 >> 2] = a.getFullYear() - 1900;
            E[b + 24 >> 2] = a.getDay();
            var c = a.getFullYear();
            E[b + 28 >> 2] = (0 !== c % 4 || 0 === c % 100 && 0 !== c % 400 ? Jc : Ic)[a.getMonth()] + a.getDate() - 1 | 0;
            E[b + 36 >> 2] = -(60 * a.getTimezoneOffset());
            c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            E[b + 32 >> 2] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
          },
          y: function(a, b, c, d, e, g, h) {
            e = -9007199254740992 > e || 9007199254740992 < e ? NaN : Number(e);
            try {
              var q = T(d);
              if (0 !== (b & 2) && 0 === (c & 2) && 2 !== (q.flags & 2097155)) throw new N(2);
              if (1 === (q.flags & 2097155)) throw new N(2);
              if (!q.Ma.jb) throw new N(43);
              if (!a) throw new N(28);
              var v = q.Ma.jb(q, a, e, b, c);
              var u = v.Xb;
              E[g >> 2] = v.Eb;
              F[h >> 2] = u;
              return 0;
            } catch (x) {
              if ("undefined" == typeof X || "ErrnoError" !== x.name) throw x;
              return -x.Pa;
            }
          },
          z: function(a, b, c, d, e, g) {
            g = -9007199254740992 > g || 9007199254740992 < g ? NaN : Number(g);
            try {
              var h = T(e);
              if (c & 2) {
                c = g;
                if (32768 !== (h.node.mode & 61440)) throw new N(43);
                if (!(d & 2)) {
                  var q = C.slice(a, a + b);
                  h.Ma.kb && h.Ma.kb(h, q, c, b, d);
                }
              }
            } catch (v) {
              if ("undefined" == typeof X || "ErrnoError" !== v.name) throw v;
              return -v.Pa;
            }
          },
          n: (a, b) => {
            Kc[a] && (clearTimeout(Kc[a].id), delete Kc[a]);
            if (!b) return 0;
            var c = setTimeout(() => {
              delete Kc[a];
              Mc(() => Wc(a, performance.now()));
            }, b);
            Kc[a] = { id: c, lc: b };
            return 0;
          },
          B: (a, b, c, d) => {
            var e = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(e, 0, 1).getTimezoneOffset();
            e = new Date(e, 6, 1).getTimezoneOffset();
            F[a >> 2] = 60 * Math.max(g, e);
            E[b >> 2] = Number(g != e);
            b = (h) => {
              var q = Math.abs(h);
              return `UTC${0 <= h ? "-" : "+"}${String(Math.floor(q / 60)).padStart(2, "0")}${String(q % 60).padStart(2, "0")}`;
            };
            a = b(g);
            b = b(e);
            e < g ? (M(a, C, c, 17), M(b, C, d, 17)) : (M(a, C, d, 17), M(b, C, c, 17));
          },
          d: () => Date.now(),
          s: () => 2147483648,
          c: () => performance.now(),
          o: (a) => {
            var b = C.length;
            a >>>= 0;
            if (2147483648 < a) return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              a: {
                d = (Math.min(2147483648, 65536 * Math.ceil(Math.max(
                  a,
                  d
                ) / 65536)) - Ma.buffer.byteLength + 65535) / 65536 | 0;
                try {
                  Ma.grow(d);
                  La();
                  var e = 1;
                  break a;
                } catch (g) {
                }
                e = void 0;
              }
              if (e) return true;
            }
            return false;
          },
          E: (a, b) => {
            var c = 0, d = 0, e;
            for (e of Pc()) {
              var g = b + c;
              F[a + d >> 2] = g;
              c += M(e, C, g, Infinity) + 1;
              d += 4;
            }
            return 0;
          },
          F: (a, b) => {
            var c = Pc();
            F[a >> 2] = c.length;
            a = 0;
            for (var d of c) a += ib(d) + 1;
            F[b >> 2] = a;
            return 0;
          },
          e: function(a) {
            try {
              var b = T(a);
              pa(b);
              return 0;
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return c.Pa;
            }
          },
          p: function(a, b) {
            try {
              var c = T(a);
              m[b] = c.tty ? 2 : P(c.mode) ? 3 : 40960 === (c.mode & 61440) ? 7 : 4;
              Ia[b + 2 >> 1] = 0;
              H[b + 8 >> 3] = BigInt(0);
              H[b + 16 >> 3] = BigInt(0);
              return 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return d.Pa;
            }
          },
          w: function(a, b, c, d) {
            try {
              a: {
                var e = T(a);
                a = b;
                for (var g, h = b = 0; h < c; h++) {
                  var q = F[a >> 2], v = F[a + 4 >> 2];
                  a += 8;
                  var u = cc(e, m, q, v, g);
                  if (0 > u) {
                    var x = -1;
                    break a;
                  }
                  b += u;
                  if (u < v) break;
                  "undefined" != typeof g && (g += u);
                }
                x = b;
              }
              F[d >> 2] = x;
              return 0;
            } catch (D) {
              if ("undefined" == typeof X || "ErrnoError" !== D.name) throw D;
              return D.Pa;
            }
          },
          D: function(a, b, c, d) {
            b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
            try {
              if (isNaN(b)) return 61;
              var e = T(a);
              bc(e, b, c);
              H[d >> 3] = BigInt(e.position);
              e.rb && 0 === b && 0 === c && (e.rb = null);
              return 0;
            } catch (g) {
              if ("undefined" == typeof X || "ErrnoError" !== g.name) throw g;
              return g.Pa;
            }
          },
          I: function(a) {
            try {
              var b = T(a);
              return b.Ma?.fsync?.(b);
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return c.Pa;
            }
          },
          t: function(a, b, c, d) {
            try {
              a: {
                var e = T(a);
                a = b;
                for (var g, h = b = 0; h < c; h++) {
                  var q = F[a >> 2], v = F[a + 4 >> 2];
                  a += 8;
                  var u = oa(e, m, q, v, g);
                  if (0 > u) {
                    var x = -1;
                    break a;
                  }
                  b += u;
                  if (u < v) break;
                  "undefined" != typeof g && (g += u);
                }
                x = b;
              }
              F[d >> 2] = x;
              return 0;
            } catch (D) {
              if ("undefined" == typeof X || "ErrnoError" !== D.name) throw D;
              return D.Pa;
            }
          },
          k: Lc
        };
        function Yc() {
          function a() {
            k.calledRun = true;
            if (!Ga) {
              if (!k.noFSInit && !Gb) {
                var b, c;
                Gb = true;
                b ??= k.stdin;
                c ??= k.stdout;
                d ??= k.stderr;
                b ? W("stdin", b) : Xb("/dev/tty", "/dev/stdin");
                c ? W("stdout", null, c) : Xb("/dev/tty", "/dev/stdout");
                d ? W("stderr", null, d) : Xb("/dev/tty1", "/dev/stderr");
                na("/dev/stdin", 0);
                na("/dev/stdout", 1);
                na("/dev/stderr", 1);
              }
              Zc.N();
              Hb = false;
              k.onRuntimeInitialized?.();
              if (k.postRun) for ("function" == typeof k.postRun && (k.postRun = [k.postRun]); k.postRun.length; ) {
                var d = k.postRun.shift();
                Ua.push(d);
              }
              Ta(Ua);
            }
          }
          if (0 < K) Xa = Yc;
          else {
            if (k.preRun) for ("function" == typeof k.preRun && (k.preRun = [k.preRun]); k.preRun.length; ) Wa();
            Ta(Va);
            0 < K ? Xa = Yc : k.setStatus ? (k.setStatus("Running..."), setTimeout(() => {
              setTimeout(() => k.setStatus(""), 1);
              a();
            }, 1)) : a();
          }
        }
        var Zc;
        (async function() {
          function a(c) {
            c = Zc = c.exports;
            k._sqlite3_free = c.P;
            k._sqlite3_value_text = c.Q;
            k._sqlite3_prepare_v2 = c.R;
            k._sqlite3_step = c.S;
            k._sqlite3_reset = c.T;
            k._sqlite3_exec = c.U;
            k._sqlite3_finalize = c.V;
            k._sqlite3_column_name = c.W;
            k._sqlite3_column_text = c.X;
            k._sqlite3_column_type = c.Y;
            k._sqlite3_errmsg = c.Z;
            k._sqlite3_clear_bindings = c._;
            k._sqlite3_value_blob = c.$;
            k._sqlite3_value_bytes = c.aa;
            k._sqlite3_value_double = c.ba;
            k._sqlite3_value_int = c.ca;
            k._sqlite3_value_type = c.da;
            k._sqlite3_result_blob = c.ea;
            k._sqlite3_result_double = c.fa;
            k._sqlite3_result_error = c.ga;
            k._sqlite3_result_int = c.ha;
            k._sqlite3_result_int64 = c.ia;
            k._sqlite3_result_null = c.ja;
            k._sqlite3_result_text = c.ka;
            k._sqlite3_aggregate_context = c.la;
            k._sqlite3_column_count = c.ma;
            k._sqlite3_data_count = c.na;
            k._sqlite3_column_blob = c.oa;
            k._sqlite3_column_bytes = c.pa;
            k._sqlite3_column_double = c.qa;
            k._sqlite3_bind_blob = c.ra;
            k._sqlite3_bind_double = c.sa;
            k._sqlite3_bind_int = c.ta;
            k._sqlite3_bind_text = c.ua;
            k._sqlite3_bind_parameter_index = c.va;
            k._sqlite3_sql = c.wa;
            k._sqlite3_normalized_sql = c.xa;
            k._sqlite3_changes = c.ya;
            k._sqlite3_close_v2 = c.za;
            k._sqlite3_create_function_v2 = c.Aa;
            k._sqlite3_update_hook = c.Ba;
            k._sqlite3_open = c.Ca;
            da = k._malloc = c.Da;
            ea = k._free = c.Ea;
            k._RegisterExtensionFunctions = c.Fa;
            Bb = c.Ga;
            Wc = c.Ha;
            sa = c.Ia;
            y = c.Ja;
            qa = c.Ka;
            Ma = c.M;
            Z = c.O;
            La();
            K--;
            k.monitorRunDependencies?.(K);
            0 == K && Xa && (c = Xa, Xa = null, c());
            return Zc;
          }
          K++;
          k.monitorRunDependencies?.(K);
          var b = { a: Xc };
          if (k.instantiateWasm) return new Promise((c) => {
            k.instantiateWasm(b, (d, e) => {
              c(a(d, e));
            });
          });
          Oa ??= k.locateFile ? k.locateFile("sql-wasm.wasm", Aa) : Aa + "sql-wasm.wasm";
          return a((await Ra(b)).instance);
        })();
        Yc();
        return Module;
      });
      return initSqlJsPromise;
    };
    if (typeof exports2 === "object" && typeof module2 === "object") {
      module2.exports = initSqlJs2;
      module2.exports.default = initSqlJs2;
    } else if (typeof define === "function" && define["amd"]) {
      define([], function() {
        return initSqlJs2;
      });
    } else if (typeof exports2 === "object") {
      exports2["Module"] = initSqlJs2;
    }
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode3 = __toESM(require("vscode"));

// src/controller.ts
var vscode = __toESM(require("vscode"));
var fs6 = __toESM(require("fs"));
var path8 = __toESM(require("path"));

// src/storage/db.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var import_sql = __toESM(require_sql_wasm());
var COLS = [
  "id",
  "sourceTool",
  "sourceVersion",
  "provider",
  "model",
  "projectId",
  "workspacePath",
  "sessionId",
  "taskId",
  "requestId",
  "messageId",
  "startedAt",
  "finishedAt",
  "durationMs",
  "inputTokens",
  "outputTokens",
  "cacheReadTokens",
  "cacheWriteTokens",
  "cacheWrite5mTokens",
  "cacheWrite1hTokens",
  "reasoningTokens",
  "totalTokens",
  "reportedCostUSD",
  "estimatedCostUSD",
  "effectiveCostUSD",
  "costBasis",
  "priceVersion",
  "status",
  "errorCategory",
  "sourceFile",
  "sourceRecordId",
  "metadata"
];
var SCHEMA = `
CREATE TABLE IF NOT EXISTS requests (${COLS.map((c) => c === "id" ? "id TEXT PRIMARY KEY" : c).join(", ")});
CREATE INDEX IF NOT EXISTS ix_ts ON requests(startedAt);
CREATE INDEX IF NOT EXISTS ix_tool ON requests(sourceTool);
CREATE INDEX IF NOT EXISTS ix_model ON requests(model);
CREATE INDEX IF NOT EXISTS ix_provider ON requests(provider);
CREATE INDEX IF NOT EXISTS ix_project ON requests(projectId);
CREATE INDEX IF NOT EXISTS ix_session ON requests(sessionId);
CREATE INDEX IF NOT EXISTS ix_file ON requests(sourceFile);
CREATE TABLE IF NOT EXISTS checkpoints (file TEXT PRIMARY KEY, size INTEGER, mtimeMs REAL, offset INTEGER);
CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT);
`;
var SQL;
var Store = class _Store {
  constructor(db, file) {
    this.db = db;
    this.file = file;
  }
  dirty = false;
  static async open(file, wasmDir) {
    SQL ??= await (0, import_sql.default)(wasmDir ? { locateFile: (f) => path.join(wasmDir, f) } : void 0);
    let db;
    try {
      db = file && fs.existsSync(file) ? new SQL.Database(fs.readFileSync(file)) : new SQL.Database();
      db.exec("SELECT count(*) FROM sqlite_master");
    } catch {
      if (file) try {
        fs.renameSync(file, file + ".corrupt");
      } catch {
      }
      db = new SQL.Database();
    }
    db.exec(SCHEMA);
    return new _Store(db, file);
  }
  upsert(rows) {
    if (!rows.length) return;
    const st = this.db.prepare(`INSERT OR REPLACE INTO requests (${COLS.join(",")}) VALUES (${COLS.map(() => "?").join(",")})`);
    this.db.exec("BEGIN");
    try {
      for (const r of rows) st.run(COLS.map((c) => c === "metadata" ? JSON.stringify(r.metadata ?? {}) : r[c] ?? null));
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    } finally {
      st.free();
    }
    this.dirty = true;
  }
  /** Replace all rows of a whole-file (non-incremental) source atomically. */
  replaceFile(file, rows) {
    this.db.run("DELETE FROM requests WHERE sourceFile = ?", [file]);
    this.upsert(rows);
    this.dirty = true;
  }
  getCheckpoint(file) {
    const r = this.query("SELECT * FROM checkpoints WHERE file = ?", [file])[0];
    return r;
  }
  setCheckpoint(c) {
    this.db.run("INSERT OR REPLACE INTO checkpoints VALUES (?,?,?,?)", [c.file, c.size, c.mtimeMs, c.offset]);
    this.dirty = true;
  }
  query(sql, params = []) {
    const st = this.db.prepare(sql);
    try {
      st.bind(params);
      const out = [];
      while (st.step()) out.push(st.getAsObject());
      return out;
    } finally {
      st.free();
    }
  }
  all() {
    return this.query("SELECT * FROM requests ORDER BY startedAt").map((r) => ({ ...r, metadata: safeJson(r.metadata) }));
  }
  count() {
    return this.query("SELECT count(*) n FROM requests")[0].n;
  }
  clear() {
    this.db.exec("DELETE FROM requests; DELETE FROM checkpoints;");
    this.dirty = true;
  }
  flush() {
    if (!this.file || !this.dirty) return;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = this.file + ".tmp";
    fs.writeFileSync(tmp, Buffer.from(this.db.export()));
    fs.renameSync(tmp, this.file);
    this.dirty = false;
  }
  sizeBytes() {
    try {
      return this.file ? fs.statSync(this.file).size : 0;
    } catch {
      return 0;
    }
  }
  close() {
    this.flush();
    this.db.close();
  }
};
function safeJson(s) {
  try {
    return typeof s === "string" ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

// src/discovery/discovery.ts
var os = __toESM(require("os"));
var path3 = __toESM(require("path"));

// src/core/fsutil.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
async function readWithRetry(file, start = 0, tries = 3) {
  for (let i = 0; ; i++) {
    try {
      const fh = await fs2.promises.open(file, "r");
      try {
        const st = await fh.stat();
        const len = Math.max(0, st.size - start);
        const buf = Buffer.alloc(len);
        if (len) await fh.read(buf, 0, len, start);
        return buf;
      } finally {
        await fh.close();
      }
    } catch (e) {
      if (i >= tries - 1 || !["EBUSY", "EPERM", "EACCES", "EAGAIN"].includes(e?.code)) throw e;
      await new Promise((r) => setTimeout(r, 150 * (i + 1)));
    }
  }
}
async function readJson(file) {
  try {
    const t = (await readWithRetry(file)).toString("utf8").replace(/^\uFEFF/, "");
    return JSON.parse(t);
  } catch {
    return void 0;
  }
}
async function exists(p) {
  try {
    await fs2.promises.access(p);
    return true;
  } catch {
    return false;
  }
}
async function walk(root, pred, maxDepth = 6) {
  const out = [];
  async function rec(dir, d) {
    let ents;
    try {
      ents = await fs2.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of ents) {
      const p = path2.join(dir, e.name);
      if (e.isDirectory() && d < maxDepth) await rec(p, d + 1);
      else if (e.isFile() && pred(p)) out.push(p);
    }
  }
  await rec(root, 0);
  return out;
}

// src/discovery/discovery.ts
var EXT_IDS = {
  "saoudrizwan.claude-dev": "cline",
  "rooveterinaryinc.roo-cline": "roo-code",
  "kilocode.kilo-code": "kilo-code"
};
var VARIANTS = ["Code", "Code - Insiders", "VSCodium", "Cursor", "Windsurf"];
function userDataRoots(env2 = process.env, platform = process.platform, home = os.homedir()) {
  if (platform === "win32") return VARIANTS.map((v) => path3.join(env2.APPDATA ?? path3.join(home, "AppData", "Roaming"), v, "User"));
  if (platform === "darwin") return VARIANTS.map((v) => path3.join(home, "Library", "Application Support", v, "User"));
  return VARIANTS.map((v) => path3.join(env2.XDG_CONFIG_HOME ?? path3.join(home, ".config"), v, "User"));
}
async function discover(opts = {}) {
  const env2 = opts.env ?? process.env, home = opts.home ?? os.homedir();
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const add = async (l) => {
    const k = path3.resolve(l.root).toLowerCase() + l.kind;
    if (seen.has(k) || !await exists(l.root)) return;
    seen.add(k);
    out.push(l);
  };
  const claudeLim = ["Cost is an API-equivalent estimate; subscription billing is not exposed by logs.", "Request duration not recorded."];
  const claudeDirs = [...(env2.CLAUDE_CONFIG_DIR ?? "").split(",").filter(Boolean), path3.join(home, ".claude"), path3.join(home, ".config", "claude")];
  for (const d of claudeDirs) await add({ tool: "claude-code", kind: "claude-projects", root: path3.join(d.trim(), "projects"), limitations: claudeLim });
  const taskLim = ["Duration approximated from next UI message timestamp.", "Model may be inferred from task metadata."];
  const roots = opts.globalStorageParent ? [opts.globalStorageParent] : userDataRoots(env2, opts.platform, home).map((r) => path3.join(r, "globalStorage"));
  for (const gs of roots) for (const [id, tool] of Object.entries(EXT_IDS)) {
    await add({ tool, kind: `${tool}-tasks`, root: path3.join(gs, id), limitations: taskLim });
  }
  await add({ tool: "cline", kind: "cline-v2", root: path3.join(env2.CLINE_DIR ?? path3.join(home, ".cline"), "data"), limitations: ["Duration not recorded per request."] });
  for (const m of opts.manual ?? []) {
    const r = path3.resolve(m);
    const lower = r.toLowerCase();
    if (lower.endsWith("projects")) await add({ tool: "claude-code", kind: "claude-projects", root: r, limitations: claudeLim });
    else if (await exists(path3.join(r, "sessions"))) await add({ tool: "cline", kind: "cline-v2", root: r, limitations: [] });
    else {
      const tool = lower.includes("roo") ? "roo-code" : lower.includes("kilo") ? "kilo-code" : "cline";
      await add({ tool, kind: `${tool}-tasks`, root: r, limitations: taskLim });
    }
  }
  return out;
}

// src/sync/sync.ts
var fs4 = __toESM(require("fs"));

// src/pricing/pricing.ts
var PRICE_VERSION = "v1-2026-01";
var TABLE = [
  ["opus-4-5", { input: 5, output: 25, cacheRead: 0.5, cacheWrite5m: 6.25, cacheWrite1h: 10 }],
  ["opus-4-6", { input: 5, output: 25, cacheRead: 0.5, cacheWrite5m: 6.25, cacheWrite1h: 10 }],
  ["opus-4", { input: 15, output: 75, cacheRead: 1.5, cacheWrite5m: 18.75, cacheWrite1h: 30 }],
  ["claude-3-opus", { input: 15, output: 75, cacheRead: 1.5, cacheWrite5m: 18.75, cacheWrite1h: 30 }],
  ["sonnet-4", { input: 3, output: 15, cacheRead: 0.3, cacheWrite5m: 3.75, cacheWrite1h: 6 }],
  ["sonnet-3-7", { input: 3, output: 15, cacheRead: 0.3, cacheWrite5m: 3.75, cacheWrite1h: 6 }],
  ["3-7-sonnet", { input: 3, output: 15, cacheRead: 0.3, cacheWrite5m: 3.75, cacheWrite1h: 6 }],
  ["3-5-sonnet", { input: 3, output: 15, cacheRead: 0.3, cacheWrite5m: 3.75, cacheWrite1h: 6 }],
  ["haiku-4-5", { input: 1, output: 5, cacheRead: 0.1, cacheWrite5m: 1.25, cacheWrite1h: 2 }],
  ["3-5-haiku", { input: 0.8, output: 4, cacheRead: 0.08, cacheWrite5m: 1, cacheWrite1h: 1.6 }],
  ["gpt-4o-mini", { input: 0.15, output: 0.6, cacheRead: 0.075 }],
  ["gpt-4o", { input: 2.5, output: 10, cacheRead: 1.25 }],
  ["gpt-4.1-mini", { input: 0.4, output: 1.6, cacheRead: 0.1 }],
  ["gpt-4.1", { input: 2, output: 8, cacheRead: 0.5 }]
];
function findPrice(model, custom = {}) {
  if (!model) return null;
  const c = custom[model];
  if (c && typeof c.input === "number" && typeof c.output === "number") {
    return { price: { input: c.input, output: c.output, cacheRead: c.cacheRead, cacheWrite5m: c.cacheWrite ?? c.cacheWrite5m, cacheWrite1h: c.cacheWrite1h ?? c.cacheWrite }, source: "custom" };
  }
  const m = model.toLowerCase();
  for (const [k, p] of TABLE) if (m.includes(k)) return { price: p, source: PRICE_VERSION };
  return null;
}
function estimateCost(r, custom) {
  const f = findPrice(r.model, custom);
  if (!f) return null;
  const p = f.price, M = 1e6;
  if (r.inputTokens === null && r.outputTokens === null) return null;
  let cost = (r.inputTokens ?? 0) * p.input / M + (r.outputTokens ?? 0) * p.output / M;
  if (r.cacheReadTokens) {
    if (p.cacheRead === void 0) return null;
    cost += r.cacheReadTokens * p.cacheRead / M;
  }
  if (r.cacheWriteTokens) {
    const w1h = r.cacheWrite1hTokens ?? 0;
    const w5m = r.cacheWrite5mTokens ?? r.cacheWriteTokens - w1h;
    if (p.cacheWrite5m === void 0) return null;
    cost += w5m * p.cacheWrite5m / M + w1h * (p.cacheWrite1h ?? p.cacheWrite5m) / M;
  }
  return { cost, source: f.source };
}
function totalTokens(r) {
  const parts = [r.inputTokens, r.outputTokens, r.cacheReadTokens, r.cacheWriteTokens, r.reasoningTokens];
  if (parts.every((p) => p === null)) return null;
  return parts.reduce((a, b) => a + (b ?? 0), 0);
}
var LOCAL_PROVIDERS = /* @__PURE__ */ new Set(["Ollama", "LM Studio"]);
function finalize(r, custom) {
  const est = estimateCost(r, custom);
  let basis = "unknown", eff = null;
  if (r.reportedCostUSD !== null) {
    basis = "reported";
    eff = r.reportedCostUSD;
  } else if (est) {
    basis = "estimated";
    eff = est.cost;
  } else if (r.provider && LOCAL_PROVIDERS.has(r.provider)) {
    basis = "estimated";
    eff = 0;
  }
  return {
    ...r,
    projectId: r.projectId ?? null,
    id: `${r.sourceTool}:${r.sourceRecordId}`,
    totalTokens: totalTokens(r),
    estimatedCostUSD: est?.cost ?? null,
    effectiveCostUSD: eff,
    costBasis: basis,
    priceVersion: est?.source ?? null
  };
}

// src/adapters/claudeCode.ts
var path4 = __toESM(require("path"));

// src/core/types.ts
var num = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null;

// src/core/provider.ts
var MAP = {
  anthropic: "Anthropic",
  "claude-code": "Anthropic",
  openai: "OpenAI",
  "openai-native": "OpenAI",
  openrouter: "OpenRouter",
  bedrock: "AWS Bedrock",
  vertex: "Google Vertex",
  gemini: "Google Gemini",
  deepseek: "DeepSeek",
  ollama: "Ollama",
  lmstudio: "LM Studio",
  "vscode-lm": "VS Code LM API",
  mistral: "Mistral",
  xai: "xAI",
  groq: "Groq",
  cline: "Cline",
  requesty: "Requesty",
  litellm: "LiteLLM",
  "kilocode": "Kilo Code Gateway",
  "roo": "Roo Cloud",
  "qwen-code": "Qwen",
  moonshot: "Moonshot",
  zai: "Z.ai"
};
function normalizeProvider(raw, model) {
  if (raw) {
    const k = raw.toLowerCase();
    return MAP[k] ?? raw;
  }
  if (!model) return null;
  const m = model.toLowerCase();
  if (m.startsWith("claude")) return "Anthropic";
  if (/^(gpt|o\d|chatgpt)/.test(m)) return "OpenAI";
  if (m.startsWith("gemini")) return "Google Gemini";
  if (m.startsWith("deepseek")) return "DeepSeek";
  if (m.includes("/")) return "OpenRouter";
  return null;
}
function projectFromPath(p) {
  if (!p) return null;
  const parts = p.replace(/[\\/]+$/, "").split(/[\\/]/);
  return parts[parts.length - 1] || null;
}

// src/adapters/claudeCode.ts
var claudeCodeAdapter = {
  tool: "claude-code",
  incremental: true,
  async listFiles(loc) {
    return walk(loc.root, (f) => f.endsWith(".jsonl"), 4);
  },
  async parseFile(file, loc, fromOffset) {
    const buf = await readWithRetry(file, fromOffset);
    const lastNl = buf.lastIndexOf(10);
    const consumed = lastNl >= 0 ? lastNl + 1 : 0;
    const text = buf.subarray(0, consumed).toString("utf8");
    const out = /* @__PURE__ */ new Map();
    const sessions2 = /* @__PURE__ */ new Set();
    let errors = 0;
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      let o;
      try {
        o = JSON.parse(line);
      } catch {
        errors++;
        continue;
      }
      if (o?.sessionId) sessions2.add(o.sessionId);
      if (o?.type !== "assistant" || !o.message?.usage) continue;
      const m = o.message, u = m.usage;
      if (m.model === "<synthetic>") continue;
      const key = `${m.id ?? o.uuid}:${o.requestId ?? ""}`;
      const ts = Date.parse(o.timestamp);
      if (!Number.isFinite(ts)) {
        errors++;
        continue;
      }
      const cc = u.cache_creation ?? {};
      out.set(key, {
        sourceTool: "claude-code",
        sourceVersion: o.version ?? null,
        provider: normalizeProvider("anthropic"),
        model: m.model ?? null,
        workspacePath: o.cwd ?? null,
        projectId: projectFromPath(o.cwd),
        sessionId: o.sessionId ?? null,
        taskId: null,
        requestId: o.requestId ?? null,
        messageId: m.id ?? null,
        startedAt: ts,
        finishedAt: null,
        durationMs: null,
        inputTokens: num(u.input_tokens),
        outputTokens: num(u.output_tokens),
        cacheReadTokens: num(u.cache_read_input_tokens),
        cacheWriteTokens: num(u.cache_creation_input_tokens),
        cacheWrite5mTokens: num(cc.ephemeral_5m_input_tokens),
        cacheWrite1hTokens: num(cc.ephemeral_1h_input_tokens),
        reasoningTokens: null,
        reportedCostUSD: num(o.costUSD),
        status: o.isApiErrorMessage ? "error" : "ok",
        errorCategory: o.isApiErrorMessage ? "api_error" : null,
        sourceFile: file,
        sourceRecordId: key,
        metadata: {
          stopReason: m.stop_reason ?? null,
          serviceTier: u.service_tier ?? null,
          isSidechain: !!o.isSidechain,
          gitBranch: o.gitBranch ?? null,
          subagent: file.includes(`${path4.sep}subagents${path4.sep}`),
          webSearchRequests: u.server_tool_use?.web_search_requests ?? null
        }
      });
    }
    return { requests: [...out.values()], newOffset: fromOffset + consumed, sessions: [...sessions2], errors };
  }
};

// src/adapters/taskFolder.ts
var path5 = __toESM(require("path"));
var fs3 = __toESM(require("fs"));
function taskFolderAdapter(tool) {
  return {
    tool,
    incremental: false,
    async listFiles(loc) {
      return walk(path5.join(loc.root, "tasks"), (f) => path5.basename(f) === "ui_messages.json", 2);
    },
    async parseFile(file, loc) {
      const msgs = await readJson(file);
      if (!Array.isArray(msgs)) return { requests: [], newOffset: 0, sessions: [], errors: 1 };
      const dir = path5.dirname(file);
      const taskId = path5.basename(dir);
      const meta = await taskMeta(loc, dir, taskId);
      const reqs = [];
      let errors = 0;
      for (let i = 0; i < msgs.length; i++) {
        const m = msgs[i];
        if (m?.say !== "api_req_started" || typeof m.text !== "string" || typeof m.ts !== "number") continue;
        let info;
        try {
          info = JSON.parse(m.text);
        } catch {
          errors++;
          continue;
        }
        const tin = num(info.tokensIn), tout = num(info.tokensOut);
        if (tin === null && tout === null && num(info.cost) === null) continue;
        let next;
        for (let j = i + 1; j < msgs.length; j++) if (typeof msgs[j]?.ts === "number") {
          next = msgs[j];
          break;
        }
        const cancel = info.cancelReason ?? null;
        const model = info.modelId ?? info.model ?? meta.model ?? null;
        const ws = meta.workspace;
        reqs.push({
          sourceTool: tool,
          sourceVersion: null,
          provider: normalizeProvider(info.apiProvider ?? info.providerId ?? meta.provider, model),
          model,
          workspacePath: ws,
          projectId: projectFromPath(ws),
          sessionId: taskId,
          taskId,
          requestId: null,
          messageId: String(m.ts),
          startedAt: m.ts,
          finishedAt: next?.ts ?? null,
          durationMs: next ? next.ts - m.ts : null,
          inputTokens: tin,
          outputTokens: tout,
          cacheReadTokens: num(info.cacheReads),
          cacheWriteTokens: num(info.cacheWrites),
          cacheWrite5mTokens: null,
          cacheWrite1hTokens: null,
          reasoningTokens: null,
          reportedCostUSD: num(info.cost),
          status: cancel ? "cancelled" : info.streamingFailedMessage ? "error" : "ok",
          errorCategory: cancel ?? (info.streamingFailedMessage ? "streaming_failed" : null),
          sourceFile: file,
          sourceRecordId: `${taskId}:${m.ts}`,
          metadata: { apiProtocol: info.apiProtocol ?? null, modelSource: info.modelId ? "request" : meta.model ? "task_metadata" : "unknown", durationIsProxy: true }
        });
      }
      return { requests: reqs, newOffset: 0, sessions: [taskId], errors };
    }
  };
}
var historyCache = /* @__PURE__ */ new Map();
async function taskMeta(loc, dir, taskId) {
  let item = await readJson(path5.join(dir, "history_item.json"));
  if (!item) {
    const hf = path5.join(loc.root, "state", "taskHistory.json");
    try {
      const st = await fs3.promises.stat(hf);
      let c = historyCache.get(hf);
      if (!c || c.mtime !== st.mtimeMs) {
        const arr = await readJson(hf);
        c = { mtime: st.mtimeMs, map: new Map((Array.isArray(arr) ? arr : []).map((x) => [String(x.id), x])) };
        historyCache.set(hf, c);
      }
      item = c.map.get(taskId);
    } catch {
    }
  }
  const tm = await readJson(path5.join(dir, "task_metadata.json"));
  const mu = Array.isArray(tm?.model_usage) && tm.model_usage.length ? tm.model_usage[tm.model_usage.length - 1] : null;
  return {
    workspace: item?.cwdOnTaskInitialization ?? item?.workspace ?? null,
    model: mu?.model_id ?? item?.modelId ?? null,
    provider: mu?.model_provider_id ?? item?.apiProvider ?? null
  };
}

// src/adapters/clineV2.ts
var path6 = __toESM(require("path"));
var clineV2Adapter = {
  tool: "cline",
  incremental: false,
  async listFiles(loc) {
    return walk(path6.join(loc.root, "sessions"), (f) => f.endsWith(".messages.json"), 2);
  },
  async parseFile(file) {
    const doc = await readJson(file);
    const msgs = doc?.messages;
    if (!Array.isArray(msgs)) return { requests: [], newOffset: 0, sessions: [], errors: 1 };
    const sid = doc.sessionId ?? path6.basename(file).replace(".messages.json", "");
    const sess = await readJson(file.replace(/\.messages\.json$/, ".json")) ?? {};
    const ws = sess.workspace_root ?? sess.cwd ?? null;
    const reqs = [];
    let errors = 0;
    for (const m of msgs) {
      if (m?.role !== "assistant" || !m.metrics) continue;
      const x = m.metrics;
      const ts = typeof m.ts === "number" ? m.ts : Date.parse(doc.updated_at);
      if (!Number.isFinite(ts)) {
        errors++;
        continue;
      }
      const model = m.modelInfo?.id ?? sess.model ?? null;
      reqs.push({
        sourceTool: "cline",
        sourceVersion: doc.origin?.version ?? null,
        provider: normalizeProvider(m.modelInfo?.provider ?? sess.provider, model),
        model,
        workspacePath: ws,
        projectId: projectFromPath(ws),
        sessionId: sid,
        taskId: sid,
        requestId: null,
        messageId: m.id ?? null,
        startedAt: ts,
        finishedAt: null,
        durationMs: null,
        inputTokens: num(x.inputTokens),
        outputTokens: num(x.outputTokens),
        cacheReadTokens: num(x.cacheReadTokens),
        cacheWriteTokens: num(x.cacheWriteTokens),
        cacheWrite5mTokens: null,
        cacheWrite1hTokens: null,
        reasoningTokens: num(x.reasoningTokens),
        reportedCostUSD: num(x.cost ?? x.totalCost),
        status: "ok",
        errorCategory: null,
        sourceFile: file,
        sourceRecordId: `${sid}:${m.id ?? ts}`,
        metadata: { agent: doc.agent ?? null, origin: sess.source ?? null, sessionStatus: sess.status ?? null }
      });
    }
    return { requests: reqs, newOffset: 0, sessions: [sid], errors };
  }
};

// src/sync/sync.ts
function adapterFor(loc) {
  if (loc.kind === "claude-projects") return claudeCodeAdapter;
  if (loc.kind === "cline-v2") return clineV2Adapter;
  return taskFolderAdapter(loc.tool);
}
async function syncSources(store, locs, custom, progress = () => {
}) {
  const out = [];
  for (const loc of locs) {
    const a = adapterFor(loc);
    const st = { tool: loc.tool, kind: loc.kind, root: loc.root, limitations: loc.limitations, files: 0, sessions: 0, requests: 0, errors: 0, lastSync: null, health: "importing" };
    out.push(st);
    progress(`Scanning ${label(loc.tool)} (${loc.kind})...`);
    let files;
    try {
      files = await a.listFiles(loc);
    } catch (e) {
      st.health = "unavailable";
      st.message = String(e?.message ?? e);
      continue;
    }
    st.files = files.length;
    progress(`Processing ${files.length} files from ${label(loc.tool)}...`);
    let imported = 0;
    for (const file of files) {
      try {
        const s = await fs4.promises.stat(file);
        const cp = store.getCheckpoint(file);
        if (cp && cp.size === s.size && cp.mtimeMs === s.mtimeMs) continue;
        let from = a.incremental && cp && s.size >= cp.offset ? cp.offset : 0;
        if (a.incremental && from === 0 && cp) store.replaceFile(file, []);
        const res = await a.parseFile(file, loc, from);
        const rows = res.requests.map((r) => finalize(r, custom));
        if (a.incremental) store.upsert(rows);
        else store.replaceFile(file, rows);
        st.errors += res.errors;
        imported += rows.length;
        store.setCheckpoint({ file, size: s.size, mtimeMs: s.mtimeMs, offset: a.incremental ? res.newOffset : s.size });
      } catch {
        st.errors++;
      }
      await new Promise((r) => setImmediate(r));
    }
    const prefix = loc.root;
    const agg = store.query(`SELECT count(*) n, count(DISTINCT sessionId) s FROM requests WHERE sourceTool = ? AND substr(sourceFile,1,?) = ?`, [loc.tool, prefix.length, prefix])[0];
    st.requests = agg.n;
    st.sessions = agg.s;
    st.lastSync = Date.now();
    st.health = st.errors ? "partial" : "up-to-date";
    if (imported) progress(`Imported ${imported.toLocaleString("en-US")} requests from ${label(loc.tool)}.`);
  }
  store.flush();
  return out;
}
function label(t) {
  return { "claude-code": "Claude Code", cline: "Cline", "roo-code": "Roo Code", "kilo-code": "Kilo Code" }[t];
}

// src/analytics/filters.ts
var DAY = 864e5;
function resolveRange(f, now = Date.now(), earliest) {
  const to = f.period === "custom" && f.to ? f.to : now;
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const days = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
  switch (f.period) {
    case "today":
      return { from: startOfToday.getTime(), to };
    case "custom":
      return { from: f.from ?? 0, to };
    case "all":
      return { from: earliest ?? 0, to };
    default:
      return { from: now - days[f.period] * DAY, to };
  }
}
var inSet = (v, s) => !s || !s.length || s.includes(v ?? "(unknown)");
function applyDims(rows, f) {
  const q = f.search?.trim().toLowerCase();
  return rows.filter((r) => inSet(r.sourceTool, f.tool) && inSet(r.provider, f.provider) && inSet(r.model, f.model) && inSet(r.projectId, f.project) && inSet(r.sessionId, f.session) && (!q || [r.id, r.model, r.projectId, r.sessionId, r.provider, r.requestId, r.messageId].some((x) => x?.toLowerCase().includes(q))));
}
function applyFilters(rows, f, now = Date.now()) {
  const earliest = rows.length ? rows[0].startedAt : void 0;
  const { from, to } = resolveRange(f, now, earliest);
  const dims = applyDims(rows, f);
  const cur = dims.filter((r) => r.startedAt >= from && r.startedAt < to);
  const len = to - from;
  const prev = f.period === "all" ? [] : dims.filter((r) => r.startedAt >= from - len && r.startedAt < from);
  return { cur, prev, from, to, hasPrev: f.period !== "all" && dims.some((r) => r.startedAt < from) };
}

// src/analytics/aggregate.ts
function totals(rows) {
  const t = { requests: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0, total: 0, cost: 0, costReported: 0, costEstimated: 0, costUnknownCount: 0, tokensUnknownCount: 0 };
  for (const r of rows) {
    t.requests++;
    t.input += r.inputTokens ?? 0;
    t.output += r.outputTokens ?? 0;
    t.cacheRead += r.cacheReadTokens ?? 0;
    t.cacheWrite += r.cacheWriteTokens ?? 0;
    t.reasoning += r.reasoningTokens ?? 0;
    if (r.totalTokens === null) t.tokensUnknownCount++;
    else t.total += r.totalTokens;
    if (r.effectiveCostUSD === null) t.costUnknownCount++;
    else {
      t.cost += r.effectiveCostUSD;
      if (r.costBasis === "reported") t.costReported += r.effectiveCostUSD;
      else t.costEstimated += r.effectiveCostUSD;
    }
  }
  return t;
}
function groupBy(rows, key) {
  const m = /* @__PURE__ */ new Map();
  for (const r of rows) {
    const k = key(r) ?? "(unknown)";
    let a = m.get(k);
    if (!a) m.set(k, a = []);
    a.push(r);
  }
  return m;
}
function pickBucket(from, to) {
  const d = (to - from) / 864e5;
  return d <= 2 ? "hour" : d <= 120 ? "day" : d <= 730 ? "week" : "month";
}
function bucketKey(ts, b) {
  const d = new Date(ts);
  if (b === "hour") {
    d.setMinutes(0, 0, 0);
    return d.getTime();
  }
  d.setHours(0, 0, 0, 0);
  if (b === "week") d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  if (b === "month") d.setDate(1);
  return d.getTime();
}
function nextBucket(ts, b) {
  const d = new Date(ts);
  if (b === "hour") d.setHours(d.getHours() + 1);
  else if (b === "day") d.setDate(d.getDate() + 1);
  else if (b === "week") d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  return d.getTime();
}
function timeSeries(rows, from, to) {
  const bucket = pickBucket(from, to);
  const pts = /* @__PURE__ */ new Map();
  const start = bucketKey(from, bucket);
  for (let t = start, i = 0; t < to && i < 2e3; t = nextBucket(t, bucket), i++) pts.set(t, { t, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0, cost: 0, requests: 0, byTool: {} });
  for (const r of rows) {
    const p = pts.get(bucketKey(r.startedAt, bucket));
    if (!p) continue;
    p.input += r.inputTokens ?? 0;
    p.output += r.outputTokens ?? 0;
    p.cacheRead += r.cacheReadTokens ?? 0;
    p.cacheWrite += r.cacheWriteTokens ?? 0;
    p.total += r.totalTokens ?? 0;
    p.cost += r.effectiveCostUSD ?? 0;
    p.requests++;
    p.byTool[r.sourceTool] = (p.byTool[r.sourceTool] ?? 0) + (r.totalTokens ?? 0);
  }
  return { bucket, points: [...pts.values()] };
}
function dimension(rows, key) {
  const out = [];
  for (const [k, rs] of groupBy(rows, key)) {
    const t = totals(rs);
    const durs = rs.map((r) => r.durationMs).filter((x) => x !== null);
    const tools = {};
    for (const r of rs) tools[r.sourceTool] = (tools[r.sourceTool] ?? 0) + (r.totalTokens ?? 0);
    const promptSide = t.input + t.cacheRead + t.cacheWrite;
    out.push({
      key: k,
      requests: t.requests,
      total: t.total,
      cost: t.cost,
      input: t.input,
      output: t.output,
      cacheRead: t.cacheRead,
      cacheWrite: t.cacheWrite,
      avgTokens: t.requests ? t.total / t.requests : 0,
      avgCost: t.requests - t.costUnknownCount ? t.cost / (t.requests - t.costUnknownCount) : null,
      cacheHitRate: promptSide ? t.cacheRead / promptSide : null,
      avgDurationMs: durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : null,
      tools,
      models: [...new Set(rs.map((r) => r.model ?? "(unknown)"))],
      first: Math.min(...rs.map((r) => r.startedAt)),
      last: Math.max(...rs.map((r) => r.startedAt))
    });
  }
  return out.sort((a, b) => b.total - a.total);
}
function sessions(rows) {
  const byS = groupBy(rows, (r) => r.sessionId ? `${r.sourceTool}|${r.sessionId}` : null);
  return dimension(rows, (r) => r.sessionId ? `${r.sourceTool}|${r.sessionId}` : null).map((d) => {
    const rs = byS.get(d.key);
    return { ...d, tool: rs[0].sourceTool, project: rs[0].projectId, durationMs: d.last - d.first };
  }).sort((a, b) => b.last - a.last);
}

// src/analytics/stats.ts
function quantile(sorted, q) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
var median = (xs) => quantile([...xs].sort((a, b) => a - b), 0.5);
function mad(xs) {
  const m = median(xs);
  return 1.4826 * median(xs.map((x) => Math.abs(x - m)));
}
function robustZ(x, xs) {
  const s = mad(xs);
  return s > 0 ? (x - median(xs)) / s : 0;
}
function linreg(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a2, b2) => a2 + b2, 0) / n, my = ys.reduce((a2, b2) => a2 + b2, 0) / n;
  let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
  }
  const b = sxx ? sxy / sxx : 0, a = my - b * mx;
  let sse = 0;
  for (let i = 0; i < n; i++) sse += (ys[i] - (a + b * xs[i])) ** 2;
  return { a, b, se: n > 2 ? Math.sqrt(sse / (n - 2)) : 0 };
}

// src/analytics/forecast.ts
var MIN_FORECAST_DAYS = 7;
function forecast(rows, now = Date.now()) {
  const DAY2 = 864e5;
  const start = now - 30 * DAY2;
  const daily = /* @__PURE__ */ new Map();
  for (const r of rows) {
    if (r.startedAt < start || r.startedAt > now || r.effectiveCostUSD === null) continue;
    const d = Math.floor((r.startedAt - start) / DAY2);
    daily.set(d, (daily.get(d) ?? 0) + r.effectiveCostUSD);
  }
  if (daily.size < MIN_FORECAST_DAYS) return null;
  const firstDay = Math.min(...daily.keys());
  const xs = [], ys = [];
  for (let d = firstDay; d < 30; d++) {
    xs.push(d);
    ys.push(daily.get(d) ?? 0);
  }
  const { a, b, se } = linreg(xs, ys);
  const nowD = new Date(now);
  const monthStart = new Date(nowD.getFullYear(), nowD.getMonth(), 1).getTime();
  const daysInMonth = new Date(nowD.getFullYear(), nowD.getMonth() + 1, 0).getDate();
  const remaining = daysInMonth - nowD.getDate();
  const mtd = rows.filter((r) => r.startedAt >= monthStart && r.startedAt <= now).reduce((s, r) => s + (r.effectiveCostUSD ?? 0), 0);
  let projected = 0;
  for (let k = 1; k <= remaining; k++) projected += Math.max(0, a + b * (29 + k));
  const band = 1.96 * se * Math.sqrt(Math.max(remaining, 1));
  return { expected: mtd + projected, low: mtd + Math.max(0, projected - band), high: mtd + projected + band, mtd, days: xs.length, slopePerDay: b };
}

// src/analytics/insightsRank.ts
var MIN_REQ = 10;
var MIN_SESS = 5;
var MIN_DAYS = 7;
var usd = (n) => `$${n < 1 ? n.toFixed(4) : n.toFixed(2)}`;
var fmt = (n) => n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${Math.round(n)}`;
function rankInsights(cur, t) {
  const out = [];
  const priced = cur.filter((r) => r.effectiveCostUSD !== null);
  if (priced.length) {
    const top = priced.reduce((a, b) => b.effectiveCostUSD > a.effectiveCostUSD ? b : a);
    out.push({
      id: "top-req",
      kind: "info",
      title: "Most Expensive Request",
      value: usd(top.effectiveCostUSD),
      detail: `${top.model ?? "unknown model"} \xB7 ${fmt(top.totalTokens ?? 0)} tokens (${top.costBasis})`,
      confidence: "high",
      basis: "Max effective cost in selected range",
      drill: { type: "request", key: top.id }
    });
  }
  const ss = sessions(cur);
  if (ss.length) {
    const top = [...ss].sort((a, b) => b.cost - a.cost)[0];
    out.push({
      id: "top-sess",
      kind: "info",
      title: "Most Expensive Session",
      value: usd(top.cost),
      detail: `${top.requests} requests \xB7 ${top.project ?? "unknown project"}`,
      confidence: "high",
      basis: "Sum of effective cost per session",
      drill: { type: "session", key: top.key }
    });
  }
  if (ss.length >= MIN_SESS) {
    const tot = ss.map((s) => s.total), med = median(tot);
    const o = ss.map((s) => ({ s, z: robustZ(s.total, tot) })).filter((x) => x.z > 3.5).sort((a, b) => b.z - a.z)[0];
    if (o && med > 0) out.push({
      id: "sess-outlier",
      kind: "warning",
      title: "Outlier Session",
      value: `${(o.s.total / med).toFixed(1)}x median`,
      detail: `One session consumed ${(o.s.total / med).toFixed(1)}x the median tokens per session (${fmt(med)}).`,
      confidence: ss.length >= 20 ? "high" : "medium",
      basis: `Robust z (median/MAD) over ${ss.length} sessions, threshold 3.5`,
      drill: { type: "session", key: o.s.key }
    });
  }
  if (t.cost > 0) {
    const m = dimension(cur, (r) => r.model).sort((a, b) => b.cost - a.cost)[0];
    out.push({
      id: "driver",
      kind: "info",
      title: "Biggest Cost Driver",
      value: m.key,
      detail: `${(m.cost / t.cost * 100).toFixed(0)}% of cost in range (${usd(m.cost)}).`,
      confidence: "high",
      basis: "Share of effective cost by model",
      drill: { type: "model", key: m.key }
    });
    const p = dimension(cur, (r) => r.projectId).sort((a, b) => b.cost - a.cost)[0];
    out.push({
      id: "top-proj",
      kind: "info",
      title: "Top Project by Cost",
      value: p.key,
      detail: `Project ${p.key} accounts for ${(p.cost / t.cost * 100).toFixed(0)}% of costs in range.`,
      confidence: "high",
      basis: "Share of effective cost by project",
      drill: { type: "project", key: p.key }
    });
  }
  return out;
}

// src/analytics/insights.ts
function computeInsights(cur, prev, hasPrev, now = Date.now()) {
  if (!cur.length) return [];
  const t = totals(cur);
  const out = rankInsights(cur, t);
  if (hasPrev && cur.length >= MIN_REQ && prev.length >= MIN_REQ) {
    const p = totals(prev);
    if (p.total > 0) {
      const g = t.total / p.total - 1;
      out.push({
        id: "growth",
        kind: g > 0.25 ? "warning" : g < -0.25 ? "positive" : "info",
        title: "Token Consumption Growth",
        value: `${g >= 0 ? "+" : ""}${(g * 100).toFixed(0)}%`,
        detail: `Token consumption ${g >= 0 ? "increased" : "decreased"} ${Math.abs(g * 100).toFixed(0)}% vs the previous equivalent period.`,
        confidence: "medium",
        basis: `${cur.length} vs ${prev.length} requests; correlation only, no causality implied`
      });
    }
  }
  const byDay = /* @__PURE__ */ new Map();
  for (const r of cur) {
    const d = new Date(r.startedAt);
    d.setHours(0, 0, 0, 0);
    byDay.set(d.getTime(), (byDay.get(d.getTime()) ?? 0) + (r.totalTokens ?? 0));
  }
  const days = [...byDay.entries()];
  if (days.length >= MIN_DAYS) {
    const vals = days.map((d) => d[1]);
    const s = days.map(([d, v]) => ({ d, v, z: robustZ(v, vals) })).filter((x) => x.z > 3.5).sort((a, b) => b.z - a.z)[0];
    if (s) out.push({
      id: "spike",
      kind: "warning",
      title: "Spike Detected",
      value: new Date(s.d).toLocaleDateString(),
      detail: `${fmt(s.v)} tokens vs median ${fmt(median(vals))} per active day.`,
      confidence: days.length >= 14 ? "high" : "medium",
      basis: `Robust z over ${days.length} active days`
    });
  }
  const promptSide = t.input + t.cacheRead + t.cacheWrite;
  if (promptSide > 0 && t.cacheRead > 0) {
    const best = dimension(cur, (r) => r.model).filter((m) => m.requests >= MIN_REQ && m.cacheHitRate !== null).sort((a, b) => b.cacheHitRate - a.cacheHitRate)[0];
    out.push({
      id: "cache",
      kind: "positive",
      title: "Highest Cache Hit Rate",
      value: `${((best?.cacheHitRate ?? t.cacheRead / promptSide) * 100).toFixed(0)}%`,
      detail: best ? `${best.key}: cache read / (input + cache read + cache write).` : "Overall share of prompt tokens served from cache.",
      confidence: best ? "high" : "low",
      basis: "Measures token reuse, not technical efficiency"
    });
  }
  const fc = forecast(cur.concat(prev), now);
  if (fc) out.push({
    id: "forecast",
    kind: "info",
    title: "Monthly Forecast",
    value: usd(fc.expected),
    detail: `Range ${usd(fc.low)} \u2013 ${usd(fc.high)} (month to date ${usd(fc.mtd)}).`,
    confidence: fc.days >= 14 ? "medium" : "low",
    basis: `Linear trend over ${fc.days} days of daily cost, \xB11.96\xB7SE`
  });
  if (cur.length >= 30) {
    const hours = new Array(24).fill(0);
    for (const r of cur) hours[new Date(r.startedAt).getHours()]++;
    const h = hours.indexOf(Math.max(...hours));
    out.push({
      id: "hour",
      kind: "info",
      title: "Peak Hour",
      value: `${String(h).padStart(2, "0")}:00`,
      detail: `${(hours[h] / cur.length * 100).toFixed(0)}% of requests start in this hour (local time).`,
      confidence: "medium",
      basis: `${cur.length} requests`
    });
  }
  const toks = cur.map((r) => r.totalTokens ?? 0);
  if (toks.length >= 20) {
    const p99 = quantile([...toks].sort((a, b) => a - b), 0.99);
    const n = toks.filter((x) => x > p99).length;
    if (n) out.push({
      id: "p99",
      kind: "info",
      title: "Exceptional Requests",
      value: `${n}`,
      detail: `Requests above p99 (${fmt(p99)} tokens).`,
      confidence: "medium",
      basis: "Percentile of total tokens per request"
    });
  }
  return out;
}

// src/analytics/engine.ts
var PAGE = 50;
function dashboard(all, f, now = Date.now()) {
  const { cur, prev, from, to, hasPrev } = applyFilters(all, f, now);
  const t = totals(cur), p = hasPrev ? totals(prev) : null;
  const ts = timeSeries(cur, from, to);
  const peak = ts.points.reduce((a, b) => b.total > a.total ? b : a, ts.points[0] ?? { t: 0, total: 0 });
  const options = {
    tool: uniq(all.map((r) => r.sourceTool)),
    provider: uniq(all.map((r) => r.provider ?? "(unknown)")),
    model: uniq(all.map((r) => r.model ?? "(unknown)")),
    project: uniq(all.map((r) => r.projectId ?? "(unknown)")),
    session: uniq(applyDims(all, { ...f, session: [] }).map((r) => r.sessionId ?? "(unknown)")).slice(0, 500)
  };
  return {
    range: { from, to },
    totals: t,
    prevTotals: p,
    series: ts,
    peak: { t: peak?.t ?? null, total: peak?.total ?? 0, bucket: ts.bucket },
    byTool: dimension(cur, (r) => r.sourceTool),
    byProject: dimension(cur, (r) => r.projectId),
    byModel: dimension(cur, (r) => r.model),
    byProvider: dimension(cur, (r) => r.provider),
    sessions: sessions(cur).slice(0, 1e3),
    insights: computeInsights(cur, prev, hasPrev, now),
    options,
    empty: all.length === 0
  };
}
function requestsPage(all, q, now = Date.now()) {
  const { cur } = applyFilters(all, q, now);
  const k = q.sort;
  const sorted = [...cur].sort((a, b) => {
    const x = a[k], y = b[k];
    const c = x === y ? 0 : x === null ? 1 : y === null ? -1 : x < y ? -1 : 1;
    return q.dir === "asc" ? c : -c;
  });
  return { total: sorted.length, page: q.page, rows: sorted.slice(q.page * PAGE, (q.page + 1) * PAGE).map(slim) };
}
function slim(r) {
  const { metadata, ...rest } = r;
  return rest;
}
var uniq = (xs) => [...new Set(xs)].sort();

// src/export/export.ts
var EXPORT_COLS = [
  "id",
  "startedAt",
  "sourceTool",
  "provider",
  "model",
  "projectId",
  "sessionId",
  "taskId",
  "requestId",
  "messageId",
  "inputTokens",
  "outputTokens",
  "cacheReadTokens",
  "cacheWriteTokens",
  "cacheWrite5mTokens",
  "cacheWrite1hTokens",
  "reasoningTokens",
  "totalTokens",
  "reportedCostUSD",
  "estimatedCostUSD",
  "effectiveCostUSD",
  "costBasis",
  "priceVersion",
  "durationMs",
  "status"
];
function cell(v) {
  if (v === null || v === void 0) return "";
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s) && typeof v === "string") s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCSV(rows, includePaths = false) {
  const cols = includePaths ? [...EXPORT_COLS, "workspacePath", "sourceFile"] : EXPORT_COLS;
  const lines = [cols.join(",")];
  for (const r of rows) lines.push(cols.map((c) => cell(c === "startedAt" ? new Date(r.startedAt).toISOString() : r[c])).join(","));
  return lines.join("\r\n") + "\r\n";
}
function toJSON(rows, includePaths = false) {
  const cols = includePaths ? [...EXPORT_COLS, "workspacePath", "sourceFile"] : EXPORT_COLS;
  return JSON.stringify({
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    count: rows.length,
    requests: rows.map((r) => Object.fromEntries(cols.map((c) => [c, c === "startedAt" ? new Date(r.startedAt).toISOString() : r[c] ?? null])))
  }, null, 2);
}

// src/preview.ts
var fs5 = __toESM(require("fs"));
var path7 = __toESM(require("path"));
async function previewContent(r, locs) {
  const NA = "Not available from source";
  if (!r) return NA;
  const file = path7.resolve(r.sourceFile).toLowerCase();
  if (!locs.some((l) => file.startsWith(path7.resolve(l.root).toLowerCase() + path7.sep))) return NA;
  try {
    const text = await fs5.promises.readFile(r.sourceFile, "utf8");
    if (r.sourceTool === "claude-code") {
      for (const line of text.split("\n")) {
        if (!r.messageId || !line.includes(r.messageId)) continue;
        const c = JSON.parse(line).message?.content;
        const t = Array.isArray(c) ? c.map((b) => b.text ?? (b.type === "tool_use" ? `[tool_use: ${b.name}]` : `[${b.type}]`)).join("\n") : String(c ?? "");
        if (t.trim()) return t.slice(0, 4e3);
      }
      return NA;
    }
    const j = JSON.parse(text);
    const arr = Array.isArray(j) ? j : j.messages;
    const m = arr?.find((x) => String(x.ts) === r.messageId || x.id === r.messageId);
    if (!m) return NA;
    const body = m.text ?? (Array.isArray(m.content) ? m.content.map((b) => b.text ?? `[${b.type}]`).join("\n") : "");
    return String(body || NA).slice(0, 4e3);
  } catch {
    return NA;
  }
}

// src/controller.ts
var Controller = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  store;
  statuses = [];
  locs = [];
  syncing = false;
  progressLog = [];
  lastSync = null;
  lastError = null;
  cache = null;
  timer;
  debounce;
  watchers = [];
  onChange = new vscode.EventEmitter();
  onProgress = new vscode.EventEmitter();
  get cfg() {
    return vscode.workspace.getConfiguration("aiTokenObservatory");
  }
  async init() {
    const dir = this.ctx.globalStorageUri.fsPath;
    fs6.mkdirSync(dir, { recursive: true });
    this.store = await Store.open(path8.join(dir, "observatory.sqlite"), path8.join(this.ctx.extensionPath, "dist"));
    this.statuses = this.ctx.globalState.get("statuses") ?? [];
    void this.rescan();
    this.schedule();
  }
  schedule() {
    clearInterval(this.timer);
    const s = Math.max(5, this.cfg.get("refreshIntervalSeconds", 30));
    this.timer = setInterval(() => void this.sync(), s * 1e3);
  }
  async rescan() {
    this.locs = await discover({ manual: this.cfg.get("manualSourceFolders", []) });
    this.setupWatchers();
    await this.sync(true);
  }
  setupWatchers() {
    this.watchers.forEach((w) => w.dispose());
    this.watchers = [];
    for (const l of this.locs) {
      try {
        const w = fs6.watch(l.root, { recursive: true }, () => {
          clearTimeout(this.debounce);
          this.debounce = setTimeout(() => void this.sync(), 1500);
        });
        w.on("error", () => w.close());
        this.watchers.push({ dispose: () => w.close() });
      } catch {
      }
    }
  }
  async sync(verbose = false) {
    if (this.syncing || !this.store) return;
    this.syncing = true;
    this.progressLog = [];
    this.onChange.fire();
    const log = (m) => {
      if (verbose || !this.lastSync) {
        this.progressLog.push(m);
        this.onProgress.fire(m);
      }
    };
    try {
      this.statuses = await syncSources(this.store, this.locs, this.cfg.get("customPricing", {}), log);
      void this.ctx.globalState.update("statuses", this.statuses);
      this.lastSync = Date.now();
      this.lastError = null;
    } catch (e) {
      this.lastError = String(e?.message ?? e);
    } finally {
      this.syncing = false;
      this.cache = null;
      this.onChange.fire();
    }
  }
  all() {
    return this.cache ??= this.store.all();
  }
  dashboard(f) {
    return dashboard(this.all(), f);
  }
  requests(q) {
    return requestsPage(this.all(), q);
  }
  request(id) {
    return this.all().find((r) => r.id === id) ?? null;
  }
  filtered(f) {
    return applyFilters(this.all(), f).cur;
  }
  /** Re-price indexed rows after a custom pricing change, without re-reading sources. */
  reprice() {
    const custom = this.cfg.get("customPricing", {});
    this.store.upsert(this.store.all().map((r) => finalize(r, custom)));
    this.store.flush();
    this.cache = null;
    this.onChange.fire();
  }
  async rebuild() {
    this.store.clear();
    this.store.flush();
    this.cache = null;
    await this.rescan();
  }
  async clearIndex() {
    this.store.clear();
    this.store.flush();
    this.cache = null;
    this.onChange.fire();
  }
  async exportReport(fmt2, f, includePaths = false) {
    const rows = f ? this.filtered(f) : this.all();
    const uri = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file(`ai-token-report.${fmt2}`), filters: { [fmt2.toUpperCase()]: [fmt2] } });
    if (!uri) return;
    const body = fmt2 === "csv" ? toCSV(rows, includePaths) : toJSON(rows, includePaths);
    await vscode.workspace.fs.writeFile(uri, Buffer.from(body, "utf8"));
    vscode.window.showInformationMessage(`Exported ${rows.length} requests to ${uri.fsPath}`);
  }
  async preview(id) {
    if (!this.cfg.get("allowContentPreview", false)) return "Content preview is disabled (Settings \u2192 Privacy).";
    return previewContent(this.request(id), this.locs);
  }
  /** Cost of the most recent session if active within the last hour and fully priced. */
  sessionCostToday() {
    if (!this.store) return null;
    const rows = this.all();
    const last = rows[rows.length - 1];
    if (!last?.sessionId || Date.now() - last.startedAt > 36e5) return null;
    const s = rows.filter((r) => r.sessionId === last.sessionId && r.sourceTool === last.sourceTool);
    if (s.some((r) => r.effectiveCostUSD === null)) return null;
    return { cost: s.reduce((a, r) => a + (r.effectiveCostUSD ?? 0), 0), session: `${last.sourceTool}: ${last.projectId ?? last.sessionId}` };
  }
  dispose() {
    clearInterval(this.timer);
    this.watchers.forEach((w) => w.dispose());
    this.store?.close();
  }
};

// src/panel.ts
var vscode2 = __toESM(require("vscode"));
var crypto2 = __toESM(require("crypto"));
var DashboardPanel = class _DashboardPanel {
  constructor(panel, ctx, c, initialPage) {
    this.panel = panel;
    this.ctx = ctx;
    this.c = c;
    this.initialPage = initialPage;
    panel.webview.html = this.html();
    panel.onDidDispose(() => this.dispose(), null, this.disposables);
    panel.webview.onDidReceiveMessage((m) => this.handle(m).catch((e) => this.post({ type: "error", message: String(e?.message ?? e) })), null, this.disposables);
    this.disposables.push(c.onChange.event(() => this.post({ type: "changed", state: this.state() })));
    this.disposables.push(c.onProgress.event((m) => this.post({ type: "progress", message: m })));
  }
  static current;
  disposables = [];
  static show(ctx, c, page) {
    if (_DashboardPanel.current) {
      _DashboardPanel.current.panel.reveal();
      if (page) _DashboardPanel.current.post({ type: "navigate", page });
      return;
    }
    const panel = vscode2.window.createWebviewPanel("aiTokenObservatory", "AI Token Observatory", vscode2.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode2.Uri.joinPath(ctx.extensionUri, "dist", "webview")]
    });
    panel.iconPath = vscode2.Uri.joinPath(ctx.extensionUri, "media", "icon.svg");
    _DashboardPanel.current = new _DashboardPanel(panel, ctx, c, page);
  }
  post(m) {
    this.panel.webview.postMessage(m);
  }
  state() {
    const cfg = this.c.cfg;
    return {
      syncing: this.c.syncing,
      lastSync: this.c.lastSync,
      lastError: this.c.lastError,
      progress: this.c.progressLog,
      statuses: this.c.statuses,
      totalIndexed: this.c.store.count(),
      dbBytes: this.c.store.sizeBytes(),
      priceVersion: PRICE_VERSION,
      settings: {
        refreshIntervalSeconds: cfg.get("refreshIntervalSeconds"),
        manualSourceFolders: cfg.get("manualSourceFolders"),
        allowContentPreview: cfg.get("allowContentPreview"),
        showStatusBar: cfg.get("showStatusBar"),
        brlRate: cfg.get("brlRate"),
        brlRateDate: cfg.get("brlRateDate"),
        customPricing: cfg.get("customPricing")
      }
    };
  }
  async handle(m) {
    if (!m || typeof m.type !== "string") return;
    const reply = (data) => this.post({ type: "reply", id: m.id, data });
    switch (m.type) {
      case "ready":
        this.post({ type: "changed", state: this.state() });
        if (this.initialPage) this.post({ type: "navigate", page: this.initialPage });
        return;
      case "dashboard":
        return reply(this.c.dashboard(m.filters));
      case "requests":
        return reply(this.c.requests(m.query));
      case "request":
        return reply(this.c.request(String(m.requestId)));
      case "preview":
        return reply(await this.c.preview(String(m.requestId)));
      case "rescan":
        this.c.rescan();
        return;
      case "refresh":
        this.c.sync(true);
        return;
      case "rebuild": {
        const ok = await vscode2.window.showWarningMessage("Rebuild the local index from sources?", { modal: true }, "Rebuild");
        if (ok) await this.c.rebuild();
        return;
      }
      case "clear": {
        const ok = await vscode2.window.showWarningMessage("Clear the local index? Source files are never touched.", { modal: true }, "Clear");
        if (ok) await this.c.clearIndex();
        return;
      }
      case "export":
        return this.c.exportReport(m.format === "json" ? "json" : "csv", m.filters, !!m.includePaths);
      case "copy":
        await vscode2.env.clipboard.writeText(String(m.text).slice(0, 500));
        vscode2.window.setStatusBarMessage("Copied", 1500);
        return;
      case "openSource": {
        const r = this.c.request(String(m.requestId));
        if (r) vscode2.commands.executeCommand("revealFileInOS", vscode2.Uri.file(r.sourceFile));
        return;
      }
      case "addFolder": {
        const u = await vscode2.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false });
        if (!u?.[0]) return;
        const cur = this.c.cfg.get("manualSourceFolders", []);
        await this.c.cfg.update("manualSourceFolders", [.../* @__PURE__ */ new Set([...cur, u[0].fsPath])], vscode2.ConfigurationTarget.Global);
        this.c.rescan();
        return;
      }
      case "setting": {
        const allowed = ["refreshIntervalSeconds", "manualSourceFolders", "allowContentPreview", "showStatusBar", "brlRate", "brlRateDate", "customPricing"];
        if (!allowed.includes(m.key)) return;
        await this.c.cfg.update(m.key, m.value, vscode2.ConfigurationTarget.Global);
        if (m.key === "refreshIntervalSeconds") this.c.schedule();
        if (m.key === "customPricing") this.c.reprice();
        if (m.key === "manualSourceFolders") this.c.rescan();
        this.post({ type: "changed", state: this.state() });
        return;
      }
    }
  }
  html() {
    const w = this.panel.webview, nonce = crypto2.randomBytes(16).toString("base64");
    const base = vscode2.Uri.joinPath(this.ctx.extensionUri, "dist", "webview");
    const js = w.asWebviewUri(vscode2.Uri.joinPath(base, "main.js")), css = w.asWebviewUri(vscode2.Uri.joinPath(base, "main.css"));
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${w.cspSource} data:; style-src ${w.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${w.cspSource};">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="${css}"><title>AI Token Observatory</title></head>
<body><div id="root"></div><script nonce="${nonce}" src="${js}"></script></body></html>`;
  }
  dispose() {
    _DashboardPanel.current = void 0;
    this.panel.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
};

// src/extension.ts
var PAGES = [
  ["overview", "Overview", "dashboard"],
  ["requests", "Requests", "list-filter"],
  ["sessions", "Sessions", "history"],
  ["projects", "Projects", "folder"],
  ["models", "Models & Providers", "circuit-board"],
  ["costs", "Cost Analysis", "credit-card"],
  ["insights", "Insights", "lightbulb"],
  ["integrations", "Integrations", "plug"],
  ["settings", "Settings", "settings-gear"]
];
var NavProvider = class {
  constructor(c) {
    this.c = c;
    c.onChange.event(() => this._e.fire());
  }
  _e = new vscode3.EventEmitter();
  onDidChangeTreeData = this._e.event;
  getTreeItem(i) {
    return i;
  }
  getChildren() {
    const items = PAGES.map(([id, name, icon]) => {
      const t = new vscode3.TreeItem(name);
      t.iconPath = new vscode3.ThemeIcon(icon);
      t.command = { command: "aiTokenObservatory.openDashboard", title: name, arguments: [id] };
      return t;
    });
    const s = new vscode3.TreeItem(this.c.syncing ? "Importing\u2026" : this.c.lastSync ? `Up to date \xB7 ${this.c.store?.count() ?? 0} requests` : "Not synced yet");
    s.iconPath = new vscode3.ThemeIcon(this.c.syncing ? "sync~spin" : this.c.lastError ? "error" : "pass");
    s.tooltip = this.c.statuses.map((x) => `${label(x.tool)} (${x.kind}): ${x.health}, ${x.requests} requests`).join("\n") || "No sources detected";
    s.command = { command: "aiTokenObservatory.openDashboard", title: "Integrations", arguments: ["integrations"] };
    return [...items, s];
  }
};
async function activate(ctx) {
  const c = new Controller(ctx);
  ctx.subscriptions.push({ dispose: () => c.dispose() });
  await c.init();
  ctx.subscriptions.push(
    vscode3.window.registerTreeDataProvider("aiTokenObservatory.nav", new NavProvider(c)),
    vscode3.commands.registerCommand("aiTokenObservatory.openDashboard", (page) => DashboardPanel.show(ctx, c, typeof page === "string" ? page : void 0)),
    vscode3.commands.registerCommand("aiTokenObservatory.rescan", () => c.rescan()),
    vscode3.commands.registerCommand("aiTokenObservatory.refresh", () => c.sync(true)),
    vscode3.commands.registerCommand("aiTokenObservatory.export", async () => {
      const f = await vscode3.window.showQuickPick(["csv", "json"], { placeHolder: "Export format (all indexed requests, usage fields only)" });
      if (f) c.exportReport(f);
    }),
    vscode3.commands.registerCommand("aiTokenObservatory.diagnostics", () => {
      const out = vscode3.window.createOutputChannel("AI Token Observatory");
      out.clear();
      out.appendLine(`Indexed requests: ${c.store.count()}  DB: ${c.store.sizeBytes()} bytes  Last sync: ${c.lastSync ? new Date(c.lastSync).toISOString() : "never"}`);
      if (c.lastError) out.appendLine(`Last error: ${c.lastError}`);
      for (const s of c.statuses) out.appendLine(`${label(s.tool)} [${s.kind}] ${s.health} root=${s.root} files=${s.files} sessions=${s.sessions} requests=${s.requests} errors=${s.errors}
  limitations: ${s.limitations.join(" | ")}`);
      if (!c.statuses.length) out.appendLine("No supported sources detected.");
      out.show();
    })
  );
  const sb = vscode3.window.createStatusBarItem(vscode3.StatusBarAlignment.Right, 100);
  sb.command = "aiTokenObservatory.openDashboard";
  const upd = () => {
    const s = c.sessionCostToday();
    if (!c.cfg.get("showStatusBar", true) || !s) {
      sb.hide();
      return;
    }
    sb.text = `$(pulse) $${s.cost.toFixed(2)}`;
    sb.tooltip = `Active session (${s.session}) \u2014 reported/estimated API-equivalent cost`;
    sb.show();
  };
  c.onChange.event(upd);
  upd();
  ctx.subscriptions.push(sb, vscode3.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("aiTokenObservatory")) {
      upd();
      c.schedule();
    }
  }));
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
