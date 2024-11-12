// pages/index.js
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "motion/react";
import Alanys from "@/assets/alanys.png";
import Jokse from "@/assets/jokse.png";
import Kornis from "@/assets/kornis.png";
import Ignas from "@/assets/ignas.png";
import Rokas from "@/assets/rokas.png";
import Karke from "@/assets/karke.png";
import Arunce from "@/assets/arunce.png";
import Image from "next/image";

export default function Home() {
  const [names, setNames] = useState([
    { id: 1, name: "Kornis", image: Kornis },
    { id: 2, name: "Ignas", image: Ignas },
    { id: 3, name: "Rokas", image: Rokas },
    { id: 4, name: "Karke", image: Karke },
    { id: 5, name: "Jokse", image: Jokse },
    { id: 6, name: "Alanys", image: Alanys },
    { id: 7, name: "Arunce", image: Arunce },
  ]);
  const [selectedName, setSelectedName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDrafted, setIsDrafted] = useState(false);
  const [isGuessing, setIsGuessing] = useState(false);
  const [guessedName, setGuessedName] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedName) {
      setMessage("Please select a name.");
      return;
    }

    // Set the selected ID to trigger animations
    const selectedPerson = names.find((n) => n.name === selectedName);
    setSelectedId(selectedPerson?.id || null);

    // Show guessing step after a brief delay
    setTimeout(() => {
      setIsGuessing(true);
    }, 500);
  };

  const handleGuessSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!guessedName) {
      setMessage("Please select a guess.");
      return;
    }

    // Save both selected name and guessed name to database
    const { data, error } = await supabase.from("selections").insert([
      {
        selected_name: selectedName,
        guessed_name: guessedName,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("An error occurred while saving your selection.");
    } else {
      setIsDrafted(true);
    }
  };

  return (
    <div className="container mx-auto flex min-h-svh flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!isGuessing && !isDrafted ? (
          <motion.div
            key="selection"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <h1 className="mb-6 text-3xl font-bold text-black">
              Pasirink ka istraukei?
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <RadioGroup value={selectedName} onValueChange={setSelectedName}>
                <div className="relative">
                  <AnimatePresence mode="popLayout">
                    {names.map((name) => {
                      const isVisible = !selectedId || selectedId === name.id;
                      return isVisible ? (
                        <motion.label
                          key={name.id}
                          layoutId={`name-${name.id}`}
                          htmlFor={name.name}
                          className="mb-2 flex min-w-72 cursor-pointer items-center justify-between space-x-2 rounded-lg border p-4"
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 1 }}
                          exit={{
                            opacity: 0,
                            transition: { duration: 0.15 },
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={name.name} id={name.name} />
                            <Label>{name.name}</Label>
                          </div>
                          <motion.div
                            className="h-8 w-8 overflow-hidden rounded-full"
                            layoutId={`avatar-${name.id}`}
                          >
                            <Image
                              src={name.image}
                              alt={name.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                            />
                          </motion.div>
                        </motion.label>
                      ) : null;
                    })}
                  </AnimatePresence>
                </div>
              </RadioGroup>

              <Button type="submit" className="mt-4">
                Toliau
              </Button>
            </form>
          </motion.div>
        ) : isGuessing && !isDrafted ? (
          <motion.div
            key="guessing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <h2 className="mb-4 text-2xl font-bold">
              Spek ka {selectedName} istrauke?
            </h2>
            <form onSubmit={handleGuessSubmit} className="flex flex-col">
              <RadioGroup value={guessedName} onValueChange={setGuessedName}>
                <div className="relative">
                  {names
                    .filter((name) => name.name !== selectedName)
                    .map((name) => (
                      <motion.label
                        key={name.id}
                        htmlFor={`guess-${name.name}`}
                        className="mb-2 flex min-w-72 cursor-pointer items-center justify-between space-x-2 rounded-lg border p-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={name.name}
                            id={`guess-${name.name}`}
                          />
                          <Label>{name.name}</Label>
                        </div>
                        <div className="h-8 w-8 overflow-hidden rounded-full">
                          <Image
                            src={name.image}
                            alt={name.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </motion.label>
                    ))}
                </div>
              </RadioGroup>

              <Button type="submit" className="mt-4">
                Tvirtinti
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="drafted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="mb-2 text-2xl font-bold">
              Sekmingai uzpildytas raffle!
            </h2>
            <p className="text-xl text-gray-600">
              Spejimas: <strong>{selectedName}</strong> istrauke{" "}
              <strong>{guessedName}</strong>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
