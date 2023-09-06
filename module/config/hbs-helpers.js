export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper("times", function(n, content) {
    let result = "";
    for (let i = 0; i < n; ++i) {
      content.data.index = i + 1;
      result += content.fn(i);
    }

    return result;
  });


  Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
      "+": lvalue + rvalue,
      "-": lvalue - rvalue,
      "*": lvalue * rvalue,
      "/": lvalue / rvalue,
      "%": lvalue % rvalue,
    }[operator];
  });

  Handlebars.registerHelper("concat", function(...args) {
    let outStr = "";
    for (const arg of args) {
      if (typeof arg != "object") {
        outStr += arg;
      }
    }
    return outStr;
  });
}
