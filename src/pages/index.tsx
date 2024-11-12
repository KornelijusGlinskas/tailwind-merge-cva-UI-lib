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
  const [giftOptions] = useState([
    "kelnes",
    "dzempas",
    "maike",
    "sortai",
    "kepure",
  ]);
  const [selectedGift, setSelectedGift] = useState("");
  const [customGift, setCustomGift] = useState("");
  const [isSelectingGift, setIsSelectingGift] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedName) {
      setMessage("Please select a name.");
      setIsLoading(false);
      return;
    }

    // Check if name already exists in database
    const { data: existingEntry, error: fetchError } = await supabase
      .from("selections")
      .select("*")
      .eq("selected_name", selectedName)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error(fetchError);
      setMessage("An error occurred while checking the selection.");
      setIsLoading(false);
      return;
    }

    if (existingEntry) {
      setMessage(`${selectedName} jau buvo pasirinktas!`);
      setIsLoading(false);
      return;
    }

    // Proceed with existing logic
    const selectedPerson = names.find((n) => n.name === selectedName);
    setSelectedId(selectedPerson?.id || null);
    setIsLoading(false);

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

    setIsSelectingGift(true);
    setIsGuessing(false);
  };

  const handleGiftSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const finalGift = selectedGift === "custom" ? customGift : selectedGift;

    if (!finalGift) {
      setMessage("Please select or enter a gift.");
      return;
    }

    // Save to database with gift information
    const { data, error } = await supabase.from("selections").insert([
      {
        selected_name: selectedName,
        guessed_name: guessedName,
        gift: finalGift,
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
        {!isGuessing && !isSelectingGift && !isDrafted ? (
          <motion.div
            key="selection"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            {message && <p className="mb-4 text-red-500">{message}</p>}
            <h1 className="mb-6 text-3xl font-bold text-black">
              Pasirink ka istraukei?
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <RadioGroup value={selectedName} onValueChange={setSelectedName}>
                <div className="relative">
                  {names.map((name) => (
                    <motion.label
                      key={name.id}
                      layoutId={`name-${name.id}`}
                      htmlFor={name.name}
                      className="mb-2 flex min-w-72 cursor-pointer items-center justify-between space-x-2 rounded-lg border p-4"
                      animate={{
                        opacity: selectedId
                          ? selectedId === name.id
                            ? 1
                            : 0.5
                          : 1,
                        scale: selectedId === name.id ? 1.05 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={name.name} id={name.name} />
                        <Label>{name.name}</Label>
                      </div>
                      <motion.div
                        className="size-12 overflow-hidden rounded-full border"
                        layoutId={`avatar-${name.id}`}
                      >
                        <Image
                          src={name.image}
                          alt={name.name}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      </motion.div>
                    </motion.label>
                  ))}
                </div>
              </RadioGroup>

              <Button type="submit" disabled={isLoading} className="mt-4">
                {isLoading ? "Tikrinama..." : "Toliau"}
              </Button>
            </form>
          </motion.div>
        ) : isGuessing && !isSelectingGift && !isDrafted ? (
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
                        <div className="size-12 overflow-hidden rounded-full border">
                          <Image
                            src={name.image}
                            alt={name.name}
                            width={32}
                            height={32}
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
        ) : isSelectingGift && !isDrafted ? (
          <motion.div
            key="gift-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <h2 className="mb-4 text-2xl font-bold">
              Ka gaus {guessedName} nuo {selectedName}?
            </h2>
            <form onSubmit={handleGiftSubmit} className="flex flex-col">
              <RadioGroup value={selectedGift} onValueChange={setSelectedGift}>
                <div className="relative">
                  {giftOptions.map((gift) => (
                    <motion.label
                      key={gift}
                      htmlFor={`gift-${gift}`}
                      className="mb-2 flex min-w-72 cursor-pointer items-center space-x-2 rounded-lg border p-4"
                    >
                      <RadioGroupItem value={gift} id={`gift-${gift}`} />
                      <Label>{gift}</Label>
                    </motion.label>
                  ))}
                  <motion.label
                    htmlFor="gift-custom"
                    className="mb-2 flex min-w-72 cursor-pointer items-center space-x-2 rounded-lg border p-4"
                  >
                    <RadioGroupItem value="custom" id="gift-custom" />
                    <Label>Kita</Label>
                  </motion.label>
                </div>
              </RadioGroup>

              {selectedGift === "custom" && (
                <input
                  type="text"
                  value={customGift}
                  onChange={(e) => setCustomGift(e.target.value)}
                  className="mb-4 rounded-lg border p-2"
                  placeholder="Iveskite dovana..."
                />
              )}

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
            <h2 className="mb-6 text-2xl font-bold">
              Sekmingai uzpildytas spejimas!
            </h2>
            <div className="mb-4 flex justify-center gap-8">
              <div className="text-center">
                <div className="mx-auto mb-2 size-24 overflow-hidden rounded-full border">
                  <Image
                    src={names.find((n) => n.name === selectedName)?.image}
                    alt={selectedName}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
                <strong className="text-lg">{selectedName}</strong>
              </div>

              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-12 w-12"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-2 size-24 overflow-hidden rounded-full border">
                  <Image
                    src={names.find((n) => n.name === guessedName)?.image}
                    alt={guessedName}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
                <strong className="text-lg">{guessedName}</strong>
              </div>
            </div>
            <p className="text-xl text-gray-600">
              Spejimas: <strong>{selectedName}</strong> istrauke{" "}
              <strong>{guessedName}</strong>, kuris galimai gaus{" "}
              <strong>
                {selectedGift === "custom" ? customGift : selectedGift}
              </strong>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
