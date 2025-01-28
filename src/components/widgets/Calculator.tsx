import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");

  const handleNumber = (num: string) => {
    setDisplay(display === "0" ? num : display + num);
    setEquation(equation + num);
  };

  const handleOperator = (op: string) => {
    setDisplay("0");
    setEquation(equation + " " + op + " ");
  };

  const calculate = () => {
    try {
      const result = eval(equation);
      setDisplay(result.toString());
      setEquation(result.toString());
    } catch (error) {
      setDisplay("Error");
      setEquation("");
    }
  };

  const clear = () => {
    setDisplay("0");
    setEquation("");
  };

  return (
    <div className="widget-card">
      <h2 className="text-lg font-semibold mb-4">Calculator</h2>
      <div className="bg-muted p-2 rounded-md mb-4">
        <div className="text-right text-2xl font-mono">{display}</div>
        <div className="text-right text-sm text-muted-foreground">{equation}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"].map(
          (btn) => (
            <Button
              key={btn}
              variant={btn.match(/[0-9.]/) ? "outline" : "secondary"}
              className="h-10"
              onClick={() => {
                if (btn === "=") calculate();
                else if (btn.match(/[+\-*/]/)) handleOperator(btn);
                else handleNumber(btn);
              }}
            >
              {btn}
            </Button>
          )
        )}
        <Button
          variant="destructive"
          className="col-span-4 mt-2"
          onClick={clear}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};