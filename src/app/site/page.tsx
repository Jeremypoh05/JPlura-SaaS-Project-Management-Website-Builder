import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Check,
  LayoutGrid,
  Laptop,
  Box,
  Workflow,
  Mail,
  BarChart,
  ShieldCheck,
  Palette,
  Users,
  Bell,
  ImageOff,
} from "lucide-react";
import Image from "next/image";
import { pricingCards } from "@/lib/constants";
import clsx from "clsx";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2
    }
  }
};


export default async function Home() {
  const prices = await stripe.prices.list({
    product: process.env.NEXT_PLURA_PRODUCT_ID,
    active: true,
  });

  return (
    <>
      {/* <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="your-existing-classes"> */}
      <section className="h-full w-full mt-[-70px] md:mt-[130px] relative flex items-center justify-center flex-col">
        {/* vertical and horizontal lines design (background) */}
        <div
          className="absolute bottom-0 left-0 right-0 top-0 
            bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] 
            bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        />
        <div className="md:mt-[120px] mt-[100px]">
          <p className="text-center md:">Run your agency, in one place</p>
          {/*This is for the background text */}
          <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
            <h1 className="text-9xl font-bold text-center md:text-[300px]">
              JPlura
            </h1>
          </div>
          <div className="flex justify-center items-center relative md:mt-[-70px]">
            <Image
              src={"/assets/preview.png"}
              alt="banner image"
              height={1200}
              width={1000}
              className="rounded-tl-2xl rounded-tr-2xl border-2 border-muted"
            />
            <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
          </div>
        </div>
      </section>
      {/* </motion.section> */}


      {/* About Section - Combined Transform Your Agency + About JPlura */}
      {/* About Section */}
      <section className="relative flex flex-col gap-4 justify-center items-center mt-10 md:mt-52 pb-20 bg-gradient-to-b from-background via-secondary/10 to-background">
        <div className="container max-w-6xl px-8">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text">
                    <h2 className="text-5xl font-bold">
                      Transform Your Agency
                    </h2>
                    <p className="text-xl font-bold mt-3">
                      Provides everything you need
                    </p>
                    <p className="text-xl font-bold">
                      to manage and scale your agency effectively
                    </p>
                  </div>
                  <p className="text-base text-muted-foreground">
                    JPlura is the ultimate white-labeled multi-tenant SaaS
                    application designed to empower business owners to
                    streamline operations and enhance client management.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1 rounded-full">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">
                      Real-time Notifications
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Stay informed with instant updates across all your accounts
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1 rounded-full">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">Team Collaboration</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Efficient team management and role-based access control
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1 rounded-full">
                      <Workflow className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">Project Pipeline</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Streamline workflows with Kanban-style project management
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1 rounded-full">
                      <LayoutGrid className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">Website Builder</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Create stunning websites with our drag-and-drop builder
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1 rounded-full">
                      <BarChart className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">Advanced Analytics</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Comprehensive insights and performance tracking
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1 rounded-full">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">Contact Management</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Track client values and manage relationships effectively
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="relative h-[500px] md:mt-12">
                {/* Main image */}
                <div className="absolute top-0 right-0 w-[350px] group">
                  <div className="bg-gradient-to-r from-primary/70 to-secondary/70 absolute inset-0 rounded-xl blur-2xl transition-all duration-500 group-hover:from-primary group-hover:to-secondary group-hover:blur-3xl" />
                  <Image
                    src={"/assets/pipeline1.png"}
                    alt="About Preview 1"
                    width={300}
                    height={200}
                    className="rounded-xl relative shadow-2xl border border-white/10 w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>

                {/* Overlapping image 1 */}
                <div className="absolute top-[150px] left-0 w-[280px] group">
                  <div className="bg-gradient-to-r from-primary/40 to-secondary/40 absolute inset-0 rounded-xl blur-2xl transition-all duration-500 group-hover:from-primary group-hover:to-secondary group-hover:blur-3xl" />
                  <Image
                    src={"/assets/contact.png"}
                    alt="About Preview 2"
                    width={250}
                    height={150}
                    className="rounded-xl relative shadow-2xl border border-white/10 w-full h-auto transform rotate-6 transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>

                {/* Overlapping image 2 */}
                <div className="absolute bottom-0 right-[50px] w-[170px] group">
                  <div className="bg-gradient-to-r from-primary/60 to-secondary/60 absolute inset-0 rounded-xl blur-2xl transition-all duration-500 group-hover:from-primary group-hover:to-secondary group-hover:blur-3xl" />
                  <Image
                    src={"/assets/notification.png"}
                    alt="About Preview 3"
                    width={200}
                    height={250}
                    className="rounded-xl relative shadow-2xl border border-white/10 w-full h-[250px] transform rotate-6 transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>

                {/* New overlapping image 4 */}
                <div className="absolute bottom-[5px] left-[-10px] w-[300px] group">
                  <div className="bg-gradient-to-r from-primary/40 to-secondary/50 absolute inset-0 rounded-xl blur-2xl transition-all duration-500 group-hover:from-primary group-hover:to-secondary group-hover:blur-3xl" />
                  <Image
                    src={"/assets/analysis.png"}
                    alt="About Preview 4"
                    width={250}
                    height={170}
                    className="rounded-xl relative shadow-2xl border border-white/10 !w-[300px] h-[150px] transform -rotate-6 transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section
      <section className="relative flex flex-col gap-4 justify-center items-center mt-10 md:mt-48 pb-20 bg-gradient-to-b from-background via-secondary/10 to-background">
        <div className="container max-w-6xl px-8">
          <div className="text-center mb-20">
            <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
              <h2 className="text-5xl font-bold mt-12 mb-4">Transform Your Agency</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              JPlura provides everything you need to manage and scale your agency effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 items-center text-center p-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Notifications</h3>
              <p className="text-muted-foreground">
                Stay informed with real-time alerts and updates about your agency and clients
              </p>
            </div>

            <div className="flex flex-col gap-4 items-center text-center p-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Contact Management</h3>
              <p className="text-muted-foreground">
                Organize and track all your client interactions in one place
              </p>
            </div>

            <div className="flex flex-col gap-4 items-center text-center p-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <ImageOff className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Media Library</h3>
              <p className="text-muted-foreground">
                Centralized media management for all your assets
              </p>
            </div>

            <div className="flex flex-col gap-4 items-center text-center p-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Palette className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">White Labeling</h3>
              <p className="text-muted-foreground">
                Customize the platform with your brand identity
              </p>
            </div>

            <div className="flex flex-col gap-4 items-center text-center p-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Secure access control for team members and clients
              </p>
            </div>

            <div className="flex flex-col gap-4 items-center text-center p-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <BarChart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Analytics</h3>
              <p className="text-muted-foreground">
                {`Comprehensive insights into your agency's performance`}
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Features Sections */}
      {/* Agency & Subaccount Dashboard Feature */}
      <section className="relative flex flex-col gap-4 md:gap-8 justify-center items-center pt-20 pb-20 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container max-w-6xl px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-20">
            <div className="flex-1 space-y-6">
              <div className="bg-gradient-to-r from-primary/60 to-primary px-4 py-1 rounded-full w-fit text-white">
                Dashboard Management
              </div>
              <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text">
                <h2 className="text-4xl font-bold">
                  Manage Your Agency and Your CLients with Powerful Tools
                </h2>
              </div>
              <p className="text-xl text-muted-foreground">
                Take control of your agency with our comprehensive dashboard.
                Monitor performance, manage clients, and streamline operations
                all in one place.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Complete agency & client overview and analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Efficient sub-account management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>{`Tracking all value of client's subaccount`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Funnel Performances & Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Real-time activity tracking</span>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4 ml-6 mt-5 md:mt-20">
              <div className="relative group">
                <div className="bg-gradient-to-r from-primary/40 to-secondary/50 absolute inset-0 rounded-xl blur-2xl transition-all duration-500 group-hover:from-primary group-hover:to-secondary group-hover:blur-3xl" />
                <Image
                  src={"/assets/dashboard1.png"}
                  alt="Dashboard Preview 1"
                  width={400}
                  height={500}
                  className="rounded-xl relative shadow-2xl h-[220px] border border-white/10 transform transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="relative group ml-24 mt-6">
                <div className="bg-gradient-to-r from-primary/40 to-secondary/50 absolute inset-0 rounded-xl blur-2xl transition-all duration-500 group-hover:from-primary group-hover:to-secondary group-hover:blur-3xl" />
                <Image
                  src={"/assets/dashboard4.png"}
                  alt="Dashboard Preview 2"
                  width={400}
                  height={400}
                  className="rounded-xl relative shadow-2xl border h-[220px] border-white/10 transform translate-y-4 transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Management Feature */}
      <section className="relative flex flex-col gap-4 md:gap-8 justify-center items-center pt-20 pb-20 bg-gradient-to-b from-background via-secondary/5 to-background">
        <div className="container max-w-6xl px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1">
              <div className="flex gap-6">
                {/* Horizontal image */}
                <div className="relative group">
                  <div className="bg-gradient-to-r from-primary/60 to-secondary/60 absolute inset-0 rounded-xl blur-2xl transition-all duration-500 group-hover:from-primary group-hover:to-secondary group-hover:blur-3xl" />
                  <Image
                    src={"/assets/pipeline1.png"}
                    alt="Pipeline Preview"
                    width={600}
                    height={310}
                    className="rounded-xl relative shadow-2xl h-[310px] border border-white/10 transform transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                {/* Vertical image */}
                {/* <div className="relative group mt-[-50px]">
                  <div className="bg-gradient-to-r from-primary/40 to-secondary/40 absolute inset-0 rounded-xl blur-2xl transition-all duration-500 group-hover:from-primary/70 group-hover:to-secondary/70 group-hover:blur-3xl" />
                  <Image
                    src={"/assets/pipeline2.png"}
                    alt="Pipeline Detail"
                    width={550}
                    height={300}
                    className="rounded-xl relative shadow-2xl h-[330px] border border-white/10 transform transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div> */}
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="bg-gradient-to-r from-primary/60 to-primary px-4 py-1 rounded-full w-fit text-white">
                Pipeline System
              </div>
              <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text">
                <h2 className="text-4xl font-bold">Streamline Your Workflow</h2>
              </div>
              <p className="text-xl text-muted-foreground">
                Keep your projects on track with our intuitive pipeline
                management system. Visualize progress, automate tasks, and boost
                productivity.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Kanban-style board visualization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Automated task management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Real-time progress tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Task prioritization and filtering</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Deadline management and reminders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Team collaboration tools</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Website Builder with dual images */}
      <section className="relative flex flex-col gap-4 md:gap-8 justify-center items-center pt-16 pb-20 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container max-w-6xl px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1 space-y-6">
              <div className="bg-gradient-to-r from-primary/60 to-primary px-4 py-1 rounded-full w-fit text-white">
                Website Builder
              </div>
              <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text">
                <h2 className="text-4xl font-bold">
                  Create Beautiful Websites
                </h2>
              </div>
              <p className="text-xl text-muted-foreground">
                Build professional websites with our drag-and-drop builder. No
                coding required - just your creativity and our powerful tools.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Intuitive drag-and-drop interface</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Responsive design tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Custom CSS properties</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Undo & Redo features</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Media management system</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Automatically deploy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>Real-time preview</span>
                </div>
              </div>
            </div>
            <div className="flex-1 relative mt:5 md:mt-28">
              <div className="relative h-[450px]">
                {/* Main image */}
                <div className="absolute top-0 right-0 group">
                  <div className="bg-gradient-to-r from-primary/50 to-secondary/50 absolute inset-0 rounded-xl blur-2xl transition-all duration-500 group-hover:from-primary group-hover:to-secondary group-hover:blur-3xl" />
                  <Image
                    src={"/assets/website-management.png"}
                    alt="About Preview 4"
                    width={500}
                    height={400}
                    className="rounded-xl relative shadow-2xl border border-white/10 !w-[380px] h-[210px] transform transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                {/* Tilted overlapping image */}
                <div className="absolute bottom-0 left-0 group ">
                  <div className="bg-gradient-to-r from-primary/50 to-secondary/50 absolute inset-0 rounded-xl blur-2xl transition-all duration-500 group-hover:from-primary group-hover:to-secondary group-hover:blur-3xl" />
                  <Image
                    src={"/assets/website-builder2.png"}
                    alt="About Preview 4"
                    width={500}
                    height={400}
                    className="rounded-xl relative shadow-2xl border border-white/10 !w-[380px] h-[210px] transform transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex justify-center items-center flex-col gap-4 md:!mt-[100px] mt-[-80px]">
        <h2 className="text-4xl text-center">Choose what fits your right</h2>
        <p className="text-muted-foreground text-center">
          Our straightforward pricing plans are tailored to meet your needs. If
          {" you're"} not <br />
          ready to commit you can get started for free.
        </p>

        <div className="flex justify-center gap-8 flex-wrap mt-6">
          <Card className={clsx("w-[300px] flex flex-col justify-between")}>
            <CardHeader>
              <CardTitle
                className={clsx({
                  "text-muted-foreground": true,
                })}
              >
                {pricingCards[0].title}
              </CardTitle>
              <CardDescription>{pricingCards[0].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-4xl font-bold">$0</span>
              <span>/ month</span>
            </CardContent>
            <CardFooter className="flex flex-col  items-start gap-4 ">
              <div>
                {pricingCards
                  .find((c) => c.title === "Starter")
                  ?.features.map((feature) => (
                    <div key={feature} className="flex gap-2">
                      <Check />
                      <p>{feature}</p>
                    </div>
                  ))}
              </div>
              <Link
                href="/agency"
                className={clsx(
                  "w-full text-center p-2 rounded-md transition duration-300 ",
                  {
                    "bg-primary hover:bg-[#172554]":
                      pricingCards[0].title === "Unlimited Saas",
                    "bg-muted-foreground hover:bg-[#334155]":
                      pricingCards[0].title !== "Unlimited Saas",
                  }
                )}
              >
                Get Started
              </Link>
            </CardFooter>
          </Card>

          {prices.data.map((card) => (
            //WIP: Wire up free product from Stripe
            <Card
              key={card.nickname}
              className={clsx("w-[300px] flex flex-col justify-between", {
                "border-2 border-primary": card.nickname === "Unlimited Saas",
              })}
            >
              <CardHeader>
                <CardTitle
                  className={clsx("", {
                    "text-muted-foreground": card.nickname !== "Unlimited Saas",
                  })}
                >
                  {card.nickname}
                </CardTitle>
                <CardDescription>
                  {
                    pricingCards.find((c) => c.title === card.nickname)
                      ?.description
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-4xl font-bold">
                  {" "}
                  {card.unit_amount && card.unit_amount / 100}
                </span>
                <span className="text-muted-foreground">
                  / {card.recurring?.interval}
                </span>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div>
                  {pricingCards
                    .find((c) => c.title === card.nickname)
                    ?.features.map((feature) => (
                      <div key={feature} className="flex gap-2">
                        <Check />
                        <p>{feature}</p>
                      </div>
                    ))}
                </div>
                <Link
                  href="/agency"
                  className={clsx(
                    "w-full text-center p-2 rounded-md transition duration-300 ",
                    {
                      "bg-primary hover:bg-[#172554]":
                        card.nickname === "Unlimited Saas",
                      "bg-muted-foreground hover:bg-[#334155]":
                        card.nickname !== "Unlimited Saas",
                    }
                  )}
                >
                  Get Started
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="flex flex-col gap-4 justify-center items-center mt-20 pt-20 pb-20 bg-secondary/30">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is JPlura?</AccordionTrigger>
              <AccordionContent>
                JPlura is a comprehensive SaaS platform that helps agencies manage their clients, projects, and websites all in one place.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What features does JPlura offer?</AccordionTrigger>
              <AccordionContent>
                JPlura offers features like project management, client tracking, website building, advanced analytics, and real-time notifications to streamline your agency operations.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How can I create sub-accounts?</AccordionTrigger>
              <AccordionContent>
                You can create new sub-accounts easily from the sub-account page after logging in. Just enter the required details and define the roles for each user.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What is the media bucket used for?</AccordionTrigger>
              <AccordionContent>
                The media bucket is a versatile tool for storing and managing images and other media that can be used in your website builder and funnel pages.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How do I track project workflows?</AccordionTrigger>
              <AccordionContent>
                You can track project workflows using the Kanban-style board in the pipelines section, where you can drag and drop tasks, set due dates, and assign members.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>Can I customize the dashboard?</AccordionTrigger>
              <AccordionContent>
                Yes, each sub-account has its own isolated dashboard that can be customized with light or dark themes and filtered notifications.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger>What kind of analytics does JPlura provide?</AccordionTrigger>
              <AccordionContent>
                JPlura provides advanced analytics, including performance tracking and insights on client values linked to projects, helping you understand potential earnings.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-8">
              <AccordionTrigger>Is there customer support available?</AccordionTrigger>
              <AccordionContent>
                Yes, we provide customer support to assist you with any questions or issues you may encounter while using JPlura.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative flex flex-col gap-4 justify-center items-center pt-20 pb-20">
        <div className="container max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                Get in Touch
              </CardTitle>
              <CardDescription className="text-center">
                {`Have questions? We're here to help.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="p-4 rounded-lg border bg-background"
                />
                <textarea
                  placeholder="Your message"
                  className="p-4 rounded-lg border bg-background min-h-[150px]"
                />
                <button className="bg-primary text-white p-4 rounded-lg hover:bg-primary/90 transition">
                  Send Message
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-background text-muted-foreground py-4">
        <div className="container text-center">
          <p>&copy; {new Date().getFullYear()} JPlura. All rights reserved.</p>
          <p>Follow us on <a href="#" className="text-primary">Twitter</a>, <a href="#" className="text-primary">Facebook</a>, and <a href="#" className="text-primary">LinkedIn</a>.</p>
        </div>
      </footer> 
    </>
  );
}
