import { Plus, MessageSquare, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Conversation } from "@/hooks/use-conversations";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}: ChatSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground truncate">
              Gemini Chat
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="px-3 pb-2">
            <Button
              onClick={onCreate}
              variant="outline"
              className={cn(
                "w-full justify-start gap-2 rounded-lg",
                collapsed && "justify-center px-0"
              )}
              size="sm"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>New Chat</span>}
            </Button>
          </div>

          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-muted-foreground px-3">
              Recent
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((convo) => (
                <SidebarMenuItem key={convo.id}>
                  <SidebarMenuButton
                    onClick={() => onSelect(convo.id)}
                    className={cn(
                      "group w-full justify-start gap-2 rounded-lg transition-colors",
                      convo.id === activeId && "bg-accent text-accent-foreground"
                    )}
                    tooltip={collapsed ? convo.title : undefined}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate text-left text-sm">
                          {convo.title}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(convo.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {conversations.length === 0 && !collapsed && (
                <p className="text-xs text-muted-foreground px-3 py-4 text-center">
                  No conversations yet
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground text-center">
            Powered by Lovable AI
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
