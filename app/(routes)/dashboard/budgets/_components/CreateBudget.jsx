"use client";
import React, { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import EmojiPicker from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

function CreateBudget({ refreshData }) {
    const [emojiIcon, setEmojiIcon] = useState("😀");
    const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const { user } = useUser();

    const onCreateBudget = async () => {
        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) {
            toast.error("Користувача не авторизовано");
            return;
        }

        try {
            const result = await db
                .insert(Budgets)
                .values({
                    name,
                    amount: parseFloat(amount),
                    createdBy: email,
                    icon: emojiIcon,
                })
                .returning({ insertedId: Budgets.id });

            if (result) {
                toast.success("✅ Конверт створено");
                refreshData?.();
            }
        } catch (error) {
            console.error("Не вдалось створити конверт:", error);
            toast.error("❌ Не вдалось створити конверт");
        }
    };

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="bg-slate-100 p-10 rounded-md items-center flex flex-col border-2 border-dashed cursor-pointer hover:shadow-md">
                        <h2 className="text-3xl">+</h2>
                        <h2>Створити новий конверт</h2>
                    </div>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Створити новий конверт</DialogTitle>
                        <DialogDescription>
                            Оберіть емодзі та введіть дані про свій конверт.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Весь інший контент - поза <DialogDescription> */}
                    <div className="mt-5">
                        <Button
                            variant="outline"
                            className="text-lg"
                            onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
                        >
                            {emojiIcon}
                        </Button>

                        {openEmojiPicker && (
                            <div className="absolute z-20 w-[350px] h-[400px] overflow-hidden">
                                <EmojiPicker
                                    height={400}
                                    width={300}
                                    onEmojiClick={(e) => {
                                        setEmojiIcon(e.emoji);
                                        setOpenEmojiPicker(false);
                                    }}
                                />
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="text-black font-medium my-1 block">Budget Name</label>
                            <Input
                                placeholder="напр. Відпочинок"
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="mt-4">
                            <label className="text-black font-medium my-1 block">Сума конверту</label>
                            <Input
                                type="number"
                                placeholder="напр. 5000₴"
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button
                                disabled={!(name && amount)}
                                onClick={onCreateBudget}
                                className="mt-5 w-full"
                            >
                                Create Budget
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CreateBudget;
