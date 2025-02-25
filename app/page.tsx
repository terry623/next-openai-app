"use client";

import { ToolInvocation } from "ai";
import { Message, useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Send,
  RefreshCw,
  Cloud,
  Thermometer,
  Info,
  Edit,
} from "lucide-react";
import { presetPrompts } from "@/prompts";
import { getWeatherIcon } from "@/utils";
import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ComponentPropsWithoutRef } from "react";

const markdownComponents = {
  a: ({ node, ...props }: ComponentPropsWithoutRef<"a"> & { node: any }) => (
    <a {...props} className="text-blue-500 hover:underline" />
  ),
  pre: ({
    node,
    ...props
  }: ComponentPropsWithoutRef<"pre"> & { node: any }) => (
    <pre {...props} className="overflow-auto max-w-full" />
  ),
  code: ({
    node,
    inline,
    ...props
  }: ComponentPropsWithoutRef<"code"> & { node: any; inline?: boolean }) =>
    inline ? (
      <code {...props} className="break-words" />
    ) : (
      <code {...props} className="overflow-x-auto block" />
    ),
  li: ({ children }: ComponentPropsWithoutRef<"li">) => {
    return <div className="space-y-1">{children}</div>;
  },
  ul: ({ children }: ComponentPropsWithoutRef<"ul">) => {
    return <div className="space-y-1">{children}</div>;
  },
  ol: ({ children }: ComponentPropsWithoutRef<"ol">) => {
    return <div className="space-y-1">{children}</div>;
  },
};

export default function Chat() {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    status,
    setMessages,
    reload,
  } = useChat({
    api: "/api/use-chat",
    maxSteps: 5,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "showWeatherInformation") {
        return "Weather information was shown to the user.";
      }

      if (toolCall.toolName === "showHackmdContent") {
        return "HackMD content was shown to the user.";
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (status === "ready") {
      inputRef.current?.focus();
    }
  }, [status, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  return (
    <div className="flex flex-col w-full h-dvh max-w-2xl py-4 px-4 md:py-8 mx-auto">
      <Card className="flex-1 overflow-hidden flex flex-col shadow-lg">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground">
              <div className="space-y-4">
                <h3 className="text-2xl font-medium mb-2">
                  Welcome to Okinawa Go
                </h3>
                <p className="text-sm max-w-md">
                  Your personal assistant for discovering Okinawa.
                </p>
              </div>
            </div>
          ) : (
            messages?.map((m: Message) => (
              <div
                key={m.id}
                className={`flex flex-col p-3 rounded-lg ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted"
                } max-w-[85%] shadow-sm transition-opacity duration-300 ease-in-out`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {m.role === "user" ? (
                    m.content
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none overflow-hidden break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={markdownComponents}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
                  const { toolCallId, args } = toolInvocation;

                  if (toolInvocation.toolName === "showWeatherInformation") {
                    return (
                      <Card
                        key={toolCallId}
                        className="mt-3 bg-card text-card-foreground overflow-hidden border"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-xl">
                              {args?.city ?? ""}
                            </h4>
                            {args?.weather && (
                              <span className="text-2xl">
                                {getWeatherIcon(args.weather)}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 bg-muted p-2 rounded">
                              {args?.weather && (
                                <div className="flex items-center">
                                  <Cloud className="h-4 w-4 mr-1" />
                                  <span className="font-medium">
                                    {args.weather}
                                  </span>
                                </div>
                              )}
                              {args?.temperature && (
                                <div className="flex items-center ml-4">
                                  <Thermometer className="h-4 w-4 mr-1" />
                                  <span className="font-medium">
                                    {args.temperature}°C
                                  </span>
                                </div>
                              )}
                            </div>
                            {args?.typicalWeather && (
                              <div className="text-sm text-muted-foreground flex items-start">
                                <Info className="h-4 w-4 mr-2 mt-1 shrink-0" />
                                <span className="break-words">
                                  {args.typicalWeather}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  if (toolInvocation.toolName === "showHackmdContent") {
                    return (
                      <Card
                        key={toolCallId}
                        className="mt-3 bg-card text-card-foreground overflow-hidden border"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-xl">行程筆記</h4>
                            <Info className="h-4 w-4" />
                          </div>

                          <div className="flex flex-col gap-3">
                            <div className="text-sm max-h-60 overflow-y-auto p-2 bg-muted rounded">
                              {args?.content && (
                                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                    components={markdownComponents}
                                  >
                                    {args.content}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </div>
                            {args?.source && (
                              <div className="text-xs text-muted-foreground">
                                <a
                                  href={args.source}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline"
                                >
                                  查看原始文檔
                                </a>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                })}
              </div>
            ))
          )}

          {(status === "submitted" || status === "streaming") && (
            <div className="flex items-center gap-2 text-muted-foreground p-2 bg-muted rounded w-fit">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                {status === "submitted" ? "Loading..." : "Thinking..."}
              </span>
            </div>
          )}

          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t">
          {error && (
            <div className="mb-4 p-3 rounded border bg-destructive/10 border-destructive/20">
              <div className="text-destructive mb-2 font-medium">
                An error occurred. Please try again.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-start mb-3">
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                setMessages([]);
                handleInputChange({
                  target: { value: "" },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {presetPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  handleInputChange({
                    target: { value: prompt },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
              >
                {prompt}
              </Button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              className="flex-1 text-sm"
              value={input}
              placeholder="How can I help you today?"
              onChange={handleInputChange}
              disabled={status !== "ready"}
            />
            <Button
              type="submit"
              size="icon"
              disabled={status !== "ready" || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
