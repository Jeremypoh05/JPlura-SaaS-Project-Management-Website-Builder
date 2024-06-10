"use client";
import React, { useState, ChangeEvent } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlignCenter,
  AlignHorizontalJustifyCenterIcon,
  AlignHorizontalJustifyEndIcon,
  AlignHorizontalJustifyStart,
  AlignHorizontalSpaceAround,
  AlignHorizontalSpaceBetween,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEndIcon,
  AlignVerticalJustifyStart,
  ChevronsLeftRightIcon,
  LucideImageDown,
  StretchVertical,
} from "lucide-react";
import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditor } from "@/providers/editor/editor-provider";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {};

const SettingsTab = (props: Props) => {
  const { state, dispatch } = useEditor();
  const [colorCode, setColorCode] = useState(
    state.editor.selectedElement.styles.color || "#000000"
  );
  const [backgroundColorCode, setBackgroundColorCode] = useState(
    state.editor.selectedElement.styles.backgroundColor || "#000000"
  );

  const handleOnChanges = (e: any) => {
    const styleSettings = e.target.id;
    let value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value; // Handle checkbox separately

    // Handle empty value for iconFontSize
    if (styleSettings === "iconFontSize" && value === "") {
      value = "";
    }

    const styleObject = {
      [styleSettings]: value, //get the id equal to the value they want.
    };

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        elementDetails: {
          ...state.editor.selectedElement,
          styles: {
            ...state.editor.selectedElement.styles,
            ...styleObject,
          },
        },
      },
    });
  };

  const handleChangeCustomValues = (e: any) => {
    const settingProperty = e.target.id;
    let value = e.target.value;
    const styleObject = {
      [settingProperty]: value,
    };

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        elementDetails: {
          ...state.editor.selectedElement,
          content: {
            ...state.editor.selectedElement.content,
            ...styleObject,
          },
        },
      },
    });
  };

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColorCode(value);
    handleOnChanges({
      target: {
        id: "color",
        value: value,
      },
    } as ChangeEvent<HTMLInputElement>);
  };

  const handleBackgroundColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBackgroundColorCode(value);
    handleOnChanges({
      target: {
        id: "backgroundColor",
        value: value,
      },
    } as ChangeEvent<HTMLInputElement>);
  };

  return (
    <Accordion
      type="multiple"
      className="w-full"
      defaultValue={["Typography", "Dimensions", "Decorations", "Flexbox"]}
    >
      <AccordionItem value="Custom" className="pl-6 pr-8 py-0  ">
        <AccordionTrigger className="!no-underline">Custom</AccordionTrigger>
        <AccordionContent>
          {state.editor.selectedElement.type === "link" &&
            !Array.isArray(state.editor.selectedElement.content) && (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground">Link Path</p>
                <Input
                  id="href"
                  placeholder="https:domain.example.com/pathname"
                  onChange={handleChangeCustomValues}
                  value={state.editor.selectedElement.content.href}
                />
              </div>
            )}

          {state.editor.selectedElement.type === "icon" && (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">Icon Name</p>
              <Input
                id="icon"
                placeholder="e.g., fa-solid fa-star"
                onChange={handleOnChanges}
                value={state.editor.selectedElement.styles.icon || ""}
              />
              <p className="text-muted-foreground">Icon Color</p>
              <Input
                type="color"
                id="iconColor"
                onChange={handleOnChanges}
                value={
                  state.editor.selectedElement.styles.iconColor || "#000000"
                }
              />
              <p className="text-muted-foreground">Icon Font Size</p>
              <Input
                type="number"
                id="iconFontSize"
                onChange={handleOnChanges}
                value={state.editor.selectedElement.styles.iconFontSize || ""}
                placeholder="Font Size in px"
              />
              <div className="flex justify-between mr-4">
                <p className="text-muted-foreground">Enable Hover Icon Color</p>
                <input
                  type="checkbox"
                  id="enableHover"
                  onChange={handleOnChanges}
                  checked={
                    state.editor.selectedElement.styles.enableHover || false
                  }
                />
              </div>

              <p className="text-muted-foreground">Hover Icon Color</p>
              <Input
                type="color"
                id="hoverIconColor"
                onChange={handleOnChanges}
                value={
                  state.editor.selectedElement.styles.hoverIconColor ||
                  "#000000"
                }
                disabled={!state.editor.selectedElement.styles.enableHover}
              />

              <p className="text-muted-foreground">Transition Duration</p>
              <Input
                type="text"
                id="transitionDuration"
                onChange={handleOnChanges}
                value={
                  state.editor.selectedElement.styles.transitionDuration ||
                  "0.3s"
                }
                placeholder="e.g., 0.3s"
              />

              <p className="text-muted-foreground">Link Path</p>
              <Input
                id="href"
                placeholder="https://domain.example.com/pathname"
                onChange={handleChangeCustomValues}
                value={
                  !Array.isArray(state.editor.selectedElement.content)
                    ? state.editor.selectedElement.content.href || ""
                    : ""
                }
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem
        value="Typography"
        className="pl-6 pr-8 py-0 border-y-[1px]"
      >
        <AccordionTrigger className="!no-underline">
          Typography
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2 ">
          <div className="flex flex-col gap-2 ">
            <p className="text-muted-foreground">Text Align</p>
            <Tabs
              onValueChange={(e) =>
                handleOnChanges({
                  target: {
                    id: "textAlign",
                    value: e,
                  },
                })
              }
              value={state.editor.selectedElement.styles.textAlign}
            >
              <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
                <TabsTrigger
                  value="left"
                  className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignLeft size={18} />
                </TabsTrigger>
                <TabsTrigger
                  value="right"
                  className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignRight size={18} />
                </TabsTrigger>
                <TabsTrigger
                  value="center"
                  className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignCenter size={18} />
                </TabsTrigger>
                <TabsTrigger
                  value="justify"
                  className="w-10 h-10 p-0 data-[state=active]:bg-muted "
                >
                  <AlignJustify size={18} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">Font Family</p>
            <Input
              id="fontFamily"
              onChange={handleOnChanges}
              value={state.editor.selectedElement.styles.fontFamily}
              placeholder="e.g., Arial, 'DM Sans', sans-serif"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Color</Label>
            <div className="flex border-[1px] rounded-md overflow-hidden">
              <Input
                type="color"
                className="w-10 h-10"
                id="color"
                onChange={handleColorChange}
                value={colorCode}
                style={{ padding: 0, margin: 0 }}
              />
              <Input
                type="text"
                className="w-full h-10"
                id="color"
                onChange={handleColorChange}
                value={colorCode}
                placeholder="#000000"
                style={{ boxShadow: "none" }}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <Label className="text-muted-foreground">Weight</Label>
              <Select
                onValueChange={(e) =>
                  handleOnChanges({
                    target: {
                      id: "font-weight",
                      value: e,
                    },
                  })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a weight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Font Weights</SelectLabel>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="normal">Regular</SelectItem>
                    <SelectItem value="lighter">Light</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground">Size</Label>
              <Input
                placeholder="px"
                id="fontSize"
                onChange={handleOnChanges}
                value={state.editor.selectedElement.styles.fontSize}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="Dimensions" className="pl-6 pr-8 py-0   ">
        <AccordionTrigger className="!no-underline">
          Dimensions
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-4 flex-col">
                <div className="flex gap-4">
                  <div>
                    <Label className="text-muted-foreground">Height</Label>
                    <Input
                      id="height"
                      placeholder="px"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.styles.height}
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Width</Label>
                    <Input
                      placeholder="px"
                      id="width"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.styles.width}
                    />
                  </div>
                </div>
              </div>
              <p>Margin px</p>
              <div className="flex gap-4 flex-col">
                <div className="flex gap-4">
                  <div>
                    <Label className="text-muted-foreground">Top</Label>
                    <Input
                      id="marginTop"
                      placeholder="px"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.styles.marginTop}
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Bottom</Label>
                    <Input
                      placeholder="px"
                      id="marginBottom"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.styles.marginBottom}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <Label className="text-muted-foreground">Left</Label>
                    <Input
                      placeholder="px"
                      id="marginLeft"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.styles.marginLeft}
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Right</Label>
                    <Input
                      placeholder="px"
                      id="marginRight"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.styles.marginRight}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p>Padding px</p>
              <div className="flex gap-4 flex-col">
                <div className="flex gap-4">
                  <div>
                    <Label className="text-muted-foreground">Top</Label>
                    <Input
                      placeholder="px"
                      id="paddingTop"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.styles.paddingTop}
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Bottom</Label>
                    <Input
                      placeholder="px"
                      id="paddingBottom"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.styles.paddingBottom}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <Label className="text-muted-foreground">Left</Label>
                    <Input
                      placeholder="px"
                      id="paddingLeft"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.styles.paddingLeft}
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Right</Label>
                    <Input
                      placeholder="px"
                      id="paddingRight"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.styles.paddingRight}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="Decorations" className="pl-6 pr-8 py-0 ">
        <AccordionTrigger className="!no-underline">
          Decorations
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4">
          <div>
            <Label className="text-muted-foreground">Opacity</Label>
            <div className="flex items-center justify-end">
              <small className="p-2">
                {typeof state.editor.selectedElement.styles?.opacity ===
                "number"
                  ? state.editor.selectedElement.styles?.opacity
                  : parseFloat(
                      (
                        state.editor.selectedElement.styles?.opacity || "0"
                      ).replace("%", "")
                    ) || 0}
                %
              </small>
            </div>
            <Slider
              onValueChange={(e) => {
                handleOnChanges({
                  target: {
                    id: "opacity",
                    value: `${e[0]}%`,
                  },
                });
              }}
              defaultValue={[
                typeof state.editor.selectedElement.styles?.opacity === "number"
                  ? state.editor.selectedElement.styles?.opacity
                  : parseFloat(
                      (
                        state.editor.selectedElement.styles?.opacity || "0"
                      ).replace("%", "")
                    ) || 0,
              ]}
              max={100}
              step={1}
            />
          </div>
          <div>
            <Label className="text-muted-foreground">Border Radius</Label>
            <div className="flex items-center justify-end">
              <small className="">
                {typeof state.editor.selectedElement.styles?.borderRadius ===
                "number"
                  ? state.editor.selectedElement.styles?.borderRadius
                  : parseFloat(
                      (
                        state.editor.selectedElement.styles?.borderRadius || "0"
                      ).replace("px", "")
                    ) || 0}
                px
              </small>
            </div>
            <Slider
              onValueChange={(e) => {
                handleOnChanges({
                  target: {
                    id: "borderRadius",
                    value: `${e[0]}px`,
                  },
                });
              }}
              defaultValue={[
                typeof state.editor.selectedElement.styles?.borderRadius ===
                "number"
                  ? state.editor.selectedElement.styles?.borderRadius
                  : parseFloat(
                      (
                        state.editor.selectedElement.styles?.borderRadius || "0"
                      ).replace("%", "")
                    ) || 0,
              ]}
              max={100}
              step={1}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Background Color</Label>
            <div className="flex border-[1px] rounded-md overflow-hidden">
              <Input
                type="color"
                className="w-10 h-10"
                id="backgroundColor"
                onChange={handleBackgroundColorChange}
                value={backgroundColorCode}
                style={{ padding: 0, margin: 0 }}
              />
              <Input
                type="text"
                className="w-full h-10"
                id="backgroundColor"
                onChange={handleBackgroundColorChange}
                value={backgroundColorCode}
                placeholder="#000000"
                style={{ boxShadow: "none" }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Background Image</Label>
            <div className="flex border-[1px] rounded-md overflow-clip">
              <div
                className="w-12 "
                style={{
                  backgroundImage:
                    state.editor.selectedElement.styles.backgroundImage,
                }}
              />
              <Input
                placeholder="url()"
                className="!border-y-0 rounded-none !border-r-0 mr-2"
                id="backgroundImage"
                onChange={handleOnChanges}
                value={state.editor.selectedElement.styles.backgroundImage}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Image Position</Label>
            <Tabs
              onValueChange={(e) =>
                handleOnChanges({
                  target: {
                    id: "backgroundSize",
                    value: e,
                  },
                })
              }
              value={state.editor.selectedElement.styles.backgroundSize?.toString()}
            >
              <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
                <TabsTrigger
                  value="cover"
                  className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                >
                  <ChevronsLeftRightIcon size={18} />
                </TabsTrigger>
                <TabsTrigger
                  value="contain"
                  className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                >
                  <AlignVerticalJustifyCenter size={22} />
                </TabsTrigger>
                <TabsTrigger
                  value="auto"
                  className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                >
                  <LucideImageDown size={18} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Box Shadow</Label>
            <Input
              placeholder="e.g., 0px 4px 6px rgba(0, 0, 0, 0.1)"
              id="boxShadow"
              onChange={handleOnChanges}
              value={state.editor.selectedElement.styles.boxShadow}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Border Width</Label>
            <Input
              placeholder="px"
              id="borderWidth"
              onChange={handleOnChanges}
              value={state.editor.selectedElement.styles.borderWidth}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Border Style</Label>
            <Select
              onValueChange={(e) =>
                handleOnChanges({
                  target: {
                    id: "borderStyle",
                    value: e,
                  },
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Border Styles</SelectLabel>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Border Color</Label>
            <Input
              type="color"
              className="w-10 h-10"
              id="borderColor"
              onChange={handleOnChanges}
              value={
                state.editor.selectedElement.styles.borderColor || "#000000"
              }
              style={{ padding: 0, margin: 0 }}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="Flexbox" className="pl-6 pr-8 py-0  ">
        <AccordionTrigger className="!no-underline">Flexbox</AccordionTrigger>
        <AccordionContent>
          <Label className="text-muted-foreground">Justify Content</Label>
          <Tabs
            onValueChange={(e) =>
              handleOnChanges({
                target: {
                  id: "justifyContent",
                  value: e,
                },
              })
            }
            value={state.editor.selectedElement.styles.justifyContent}
          >
            <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
              {[
                {
                  value: "space-between",
                  icon: <AlignHorizontalSpaceBetween size={18} />,
                  label: "Space Between",
                },
                {
                  value: "space-evenly",
                  icon: <AlignHorizontalSpaceAround size={18} />,
                  label: "Space Evenly",
                },
                {
                  value: "center",
                  icon: <AlignHorizontalJustifyCenterIcon size={18} />,
                  label: "Center",
                },
                {
                  value: "start",
                  icon: <AlignHorizontalJustifyStart size={18} />,
                  label: "Start",
                },
                {
                  value: "end",
                  icon: <AlignHorizontalJustifyEndIcon size={18} />,
                  label: "End",
                },
              ].map((item) => (
                <TooltipProvider key={item.value} delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger>
                      <TabsTrigger
                        value={item.value}
                        className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                      >
                        {item.icon}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{item.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </TabsList>
          </Tabs>
          <Label className="text-muted-foreground">Align Items</Label>
          <Tabs
            onValueChange={(e) =>
              handleOnChanges({
                target: {
                  id: "alignItems",
                  value: e,
                },
              })
            }
            value={state.editor.selectedElement.styles.alignItems}
          >
            <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
              {[
                {
                  value: "center",
                  icon: <AlignVerticalJustifyCenter size={18} />,
                  label: "Center",
                },
                {
                  value: "start",
                  icon: <AlignVerticalJustifyStart size={18} />,
                  label: "Start",
                },
                {
                  value: "end",
                  icon: <AlignVerticalJustifyEndIcon size={18} />,
                  label: "End",
                },
                {
                  value: "stretch",
                  icon: <StretchVertical size={18} />,
                  label: "Stretch",
                },
              ].map((item) => (
                <TooltipProvider key={item.value} delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger>
                      <TabsTrigger
                        value={item.value}
                        className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                      >
                        {item.icon}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{item.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Input
              className="h-4 w-4"
              placeholder="px"
              type="checkbox"
              id="display"
              onChange={(va) => {
                handleOnChanges({
                  target: {
                    id: "display",
                    value: va.target.checked ? "flex" : "block",
                  },
                });
              }}
            />
            <Label className="text-muted-foreground">Flex</Label>
          </div>
          <div>
            <Label className="text-muted-foreground"> Direction</Label>
            <Input
              placeholder="px"
              id="flexDirection"
              onChange={handleOnChanges}
              value={state.editor.selectedElement.styles.flexDirection}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="Positioning" className="pl-6 pr-8 py-0 ">
        <AccordionTrigger className="!no-underline">
          Positioning
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Position</Label>
            <Select
              onValueChange={(e) =>
                handleOnChanges({
                  target: {
                    id: "position",
                    value: e,
                  },
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Position Types</SelectLabel>
                  <SelectItem value="static">Static</SelectItem>
                  <SelectItem value="relative">Relative</SelectItem>
                  <SelectItem value="absolute">Absolute</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-4">
            <div>
              <Label className="text-muted-foreground">Top</Label>
              <Input
                placeholder="px"
                id="top"
                onChange={handleOnChanges}
                value={state.editor.selectedElement.styles.top}
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Right</Label>
              <Input
                placeholder="px"
                id="right"
                onChange={handleOnChanges}
                value={state.editor.selectedElement.styles.right}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <Label className="text-muted-foreground">Bottom</Label>
              <Input
                placeholder="px"
                id="bottom"
                onChange={handleOnChanges}
                value={state.editor.selectedElement.styles.bottom}
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Left</Label>
              <Input
                placeholder="px"
                id="left"
                onChange={handleOnChanges}
                value={state.editor.selectedElement.styles.left}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Z-Index</Label>
            <Input
              placeholder="Enter z-index"
              id="zIndex"
              onChange={handleOnChanges}
              value={state.editor.selectedElement.styles.zIndex}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="Transform" className="pl-6 pr-8 py-0 ">
        <AccordionTrigger className="!no-underline">Transform</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Transform</Label>
            <Input
              placeholder="e.g., rotate(45deg) scale(1.5)"
              id="transform"
              onChange={handleOnChanges}
              value={state.editor.selectedElement.styles.transform}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SettingsTab;
