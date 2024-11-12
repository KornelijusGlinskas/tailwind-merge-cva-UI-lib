// pages/index.js
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [names, setNames] = useState([
    { id: 1, name: "Kornis" },
    { id: 2, name: "Ignas" },
    { id: 3, name: "Rokas" },
    { id: 4, name: "Karke" },
    { id: 5, name: "Jokubas" },
    { id: 6, name: "Alanas" },
    { id: 7, name: "Arunce" },
  ]);
  const [selectedName, setSelectedName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedName) {
      setMessage("Please select a name.");
      return;
    }

    // Check if the name has already been selected
    const { data: existingSelection, error: selectError } = await supabase
      .from("selections")
      .select("*")
      .eq("selected_name", selectedName)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 is the code for 'No rows found'
      console.error(selectError);
      setMessage("An error occurred.");
      return;
    }

    if (existingSelection) {
      setMessage(
        "This person has already been selected. Please choose another.",
      );
      return;
    }

    // Save the selection to the database
    const { data, error } = await supabase
      .from("selections")
      .insert([{ selected_name: selectedName }]);

    if (error) {
      console.error(error);
      setMessage("An error occurred while saving your selection.");
    } else {
      setMessage("Your selection has been saved successfully!");
    }
  };
  console.log(names);

  return (
    <div className="container mx-auto flex min-h-svh flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-3xl font-bold text-black">Select your person</h1>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <RadioGroup value={selectedName} onValueChange={setSelectedName}>
          {names.map((name) => (
            <label
              htmlFor={name.name}
              className="flex min-w-72 cursor-pointer items-center space-x-2 rounded-lg border p-4"
              key={name.id}
            >
              <RadioGroupItem key={name.id} value={name.name} id={name.name} />

              <Label>{name.name}</Label>
            </label>
          ))}
        </RadioGroup>

        <Button type="submit" className="mt-4">
          Continue
        </Button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
