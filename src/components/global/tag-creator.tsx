import { Tag } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import TagComponent from "./tag";
import { PlusCircleIcon, TrashIcon, X } from "lucide-react";
import { toast } from "../ui/use-toast";
import { v4 } from "uuid";
import {
  deleteTag,
  getTagsForSubaccount,
  saveActivityLogsNotification,
  upsertTag,
} from "@/lib/queries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

type Props = {
  subAccountId: string;
  getSelectedTags: (tags: Tag[]) => void;
  defaultTags?: Tag[];
};

const TagColors = ["BLUE", "ORANGE", "ROSE", "PURPLE", "GREEN"] as const;
export type TagColor = (typeof TagColors)[number];

const TagCreator = ({
  subAccountId,
  getSelectedTags,
  defaultTags = [],
}: Props) => {
  //keep track of the array of selected tags
  const [selectedTags, setSelectedTags] = useState<Tag[]>(defaultTags || []);
  const [tags, setTags] = useState<Tag[]>([]); //all tags that show up in the tickets(included we created b4).
  const router = useRouter();
  const [value, setValue] = useState(""); //what users looking for
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    getSelectedTags(selectedTags);
    //so everytime the selected tags change, we going to give the getSelectedTags function the new selected tags
  }, [selectedTags]);

  useEffect(() => {
    if (subAccountId) {
      const fetchData = async () => {
        //fetch from database 
        const response = await getTagsForSubaccount(subAccountId);
        if (response) setTags(response.Tags);
      };
      fetchData();
    }
  }, [subAccountId]);

  const handleAddTag = async () => {
    if (!value) {
      toast({
        variant: "destructive",
        title: "Tags need to have a name",
      });
      return;
    }
    if (!selectedColor) {
      toast({
        variant: "destructive",
        title: "Please Select a color",
      });
      return;
    }
    //update the database as well
    const tagData: Tag = {
      color: selectedColor,
      createdAt: new Date(),
      id: v4(),
      name: value,
      subAccountId,
      updatedAt: new Date(),
    };

    setTags([...tags, tagData]); //set all the tags we have to everything that's already in there plus the new tagData
    setValue(""); //after created the tag setValue to empty
    setSelectedColor(""); //color as well
    try {
      const response = await upsertTag(subAccountId, tagData);
      toast({
        title: "Created the tag",
      });

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a tag | ${response?.name}`,
        subaccountId: subAccountId,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not create tag",
      });
    }
  };

  const handleDeleteSelection = (tagId: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId));
  };

  //The purpose of this function is to add a selected tag to the selectedTags state array if it is not already present in the array.
  //The every method is used to check if all elements in the selectedTags array have id properties that are not equal to the id property of the tag object.
  // If this condition is true, the tag object is added to the selectedTags array using the spread operator (...selectedTags). (avoid duplicate, because if id is same, we still can add)
  const handleAddSelections = (tag: Tag) => {
    if (selectedTags.every((t) => t.id !== tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
    try {
      const response = await deleteTag(tagId);
      toast({
        title: "Deleted tag",
        description: "The tag is deleted from your subaccount.",
      });

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted a tag | ${response?.name}`,
        subaccountId: subAccountId,
      });

      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not delete tag",
      });
    }
  };

  return (
    <AlertDialog>
      <Command className="bg-transparent">
        {/*!!selectedTags.length && expression checks if the selectedTags array is truthy 
        (i.e., it has a length greater than 0). If the selectedTags array is truthy, the code inside the {!!selectedTags.length && ( block is executed. */}
        {!!selectedTags.length && (
          <div className="flex flex-wrap gap-2 p-2 bg-background border-2 border-border rounded-md">
            {selectedTags.map((tag) => (
              <div key={tag.id} className="flex items-center">
                <TagComponent title={tag.name} colorName={tag.color} />
                {/*click to remove tag */}
                <X
                  size={14}
                  className="text-muted-foreground cursor-pointer"
                  onClick={() => handleDeleteSelection(tag.id)}
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 my-2">
          {TagColors.map((colorName) => (
            <TagComponent
              key={colorName}
              selectedColor={setSelectedColor}
              title=""
              colorName={colorName}
            />
          ))}
        </div>
        <div className="relative w-full">
          <CommandInput
            placeholder="Search for tag..."
            value={value}
            onValueChange={setValue}
          />
          <PlusCircleIcon
            onClick={handleAddTag}
            size={20}
            className="absolute top-1/2 transform -translate-y-1/2 right-2 hover:text-primary transition-all cursor-pointer text-muted-foreground"
          />
        </div>
        <CommandList>
          <CommandSeparator />
          <CommandGroup heading="Tags">
            {tags.map((tag) => (
              <CommandItem
                key={tag.id}
                className="hover:!bg-secondary !bg-transparent flex items-center justify-between !font-light cursor-pointer"
              >
                <div onClick={() => handleAddSelections(tag)}>
                  <TagComponent title={tag.name} colorName={tag.color} />
                </div>

                <AlertDialogTrigger>
                  <TrashIcon
                    size={16}
                    className="cursor-pointer text-muted-foreground hover:text-rose-400  transition-all"
                  />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-left">
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                      This action cannot be undone. This will permanently delete
                      your the tag and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="items-center">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive"
                      onClick={() => handleDeleteTag(tag.id)}
                    >
                      Delete Tag
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandEmpty>No results found.</CommandEmpty>
        </CommandList>
      </Command>
    </AlertDialog>
  );
};

export default TagCreator;
