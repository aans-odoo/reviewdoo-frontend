import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Loader2, RefreshCw, Users, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert } from "@/components/shared/Alert";
import { Loading } from "@/components/shared/Loading";
import { SearchableSelect, type SearchableSelectOption } from "@/components/shared/SearchableSelect";
import { ActivityTable } from "@/components/activity/ActivityTable";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import {
  ACTIVITY_CATEGORY_LABELS,
  type ActivityCategory,
  type ActivityEventDefinition,
  type ActivityListResponse,
} from "@/lib/activity";

const ALL = "all";
const DEFAULT_LIMIT = 50;

interface UserOption {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

function initials(name: string, email: string): string {
  if (name.trim()) {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.charAt(0).toUpperCase();
}

/** Small avatar for the user filter, same fallback style as the table's actor cell. */
function UserAvatar({ user }: { user: UserOption }) {
  return (
    <Avatar className="h-6 w-6 border">
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
      <AvatarFallback className="from-emerald-800 to-teal-600 text-[9px]">
        {initials(user.name, user.email)}
      </AvatarFallback>
    </Avatar>
  );
}

/**
 * Admin activity feed: page views, searches, checklist changes, MCP tool
 * calls and background jobs, newest first, filterable by category, event,
 * actor type and user.
 */
export function ActivityPage() {
  const [data, setData] = useState<ActivityListResponse | null>(null);
  const [events, setEvents] = useState<ActivityEventDefinition[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [category, setCategory] = useState<string>(ALL);
  const [event, setEvent] = useState<string>(ALL);
  const [actorKind, setActorKind] = useState<string>(ALL);
  const [actorId, setActorId] = useState<string>(ALL);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const eventMap = useMemo(() => new Map(events.map((e) => [e.event, e])), [events]);
  const categories = useMemo(
    () => [...new Set(events.map((e) => e.category))] as ActivityCategory[],
    [events]
  );
  const eventSelectOptions = useMemo<SearchableSelectOption[]>(() => {
    const scoped = category === ALL ? events : events.filter((e) => e.category === category);
    return [
      { value: ALL, label: "All events" },
      // The raw event id is searchable too (e.g. "mcp", "checklist.update").
      ...scoped.map((e) => ({ value: e.event, label: e.label, hint: e.event })),
    ];
  }, [events, category]);
  const userSelectOptions = useMemo<SearchableSelectOption[]>(
    () => [
      {
        value: ALL,
        label: "Any user",
        icon: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-theme-bg-hover">
            <Users className="h-3 w-3 text-theme-text-muted" aria-hidden="true" />
          </span>
        ),
      },
      ...users.map((u) => ({
        value: u.id,
        label: u.name || u.email,
        hint: u.name ? u.email : undefined,
        icon: <UserAvatar user={u} />,
      })),
    ],
    [users]
  );

  // Filter options load once; failures only degrade the filters.
  useEffect(() => {
    api
      .get<{ events: ActivityEventDefinition[] }>("/activity/events")
      .then((res) => setEvents(res.data.events))
      .catch(() => undefined);
    api
      .get<{ users: UserOption[] }>("/users")
      .then((res) => setUsers(res.data.users))
      .catch(() => undefined);
  }, []);

  const fetchActivity = useCallback(async () => {
    const params: Record<string, string | number> = { offset, limit };
    if (event !== ALL) params.event = event;
    else if (category !== ALL) params.category = category;
    if (actorKind !== ALL) params.actorKind = actorKind;
    if (actorId !== ALL) params.actorId = actorId;
    try {
      const res = await api.get<ActivityListResponse>("/activity", { params });
      setData(res.data);
      setError("");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load activity"));
    } finally {
      setLoading(false);
    }
  }, [offset, limit, event, category, actorKind, actorId]);

  useEffect(() => {
    void fetchActivity();
  }, [fetchActivity]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActivity();
    setRefreshing(false);
  };

  // Any filter change goes back to the newest rows.
  const withReset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setOffset(0);
  };

  const handleCategoryChange = (v: string) => {
    setCategory(v);
    // Drop an event selection that no longer belongs to the category.
    if (v !== ALL && event !== ALL && eventMap.get(event)?.category !== v) setEvent(ALL);
    setOffset(0);
  };

  const handleActorKindChange = (v: string) => {
    setActorKind(v);
    // A specific user only makes sense for signed-in actors.
    if (v !== ALL && v !== "user") setActorId(ALL);
    setOffset(0);
  };

  const hasFilters = category !== ALL || event !== ALL || actorKind !== ALL || actorId !== ALL;
  const clearFilters = () => {
    setCategory(ALL);
    setEvent(ALL);
    setActorKind(ALL);
    setActorId(ALL);
    setOffset(0);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-theme-text">Activity</h2>
        <p className="max-w-2xl text-sm text-theme-text-muted">
          Who is using Reviewdoo and how: page views, searches, checklist changes, MCP tool calls
          and background jobs. Signed-in users are named; public visitors and MCP clients show as
          Guest.
        </p>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          {error && (
            <Alert variant="error" onDismiss={() => setError("")}>{error}</Alert>
          )}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4 text-theme-text-muted" aria-hidden="true" />
                    Activity log
                  </CardTitle>
                  <CardDescription>
                    {data ? `${data.total.toLocaleString()} events` : "Newest first"}
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  Refresh
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-40" aria-label="Filter by category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {ACTIVITY_CATEGORY_LABELS[c] ?? c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <SearchableSelect
                  className="w-48"
                  aria-label="Filter by event"
                  value={event}
                  onChange={withReset(setEvent)}
                  options={eventSelectOptions}
                  searchPlaceholder="Search events..."
                  emptyText="No matching events"
                />
                <Select value={actorKind} onValueChange={handleActorKindChange}>
                  <SelectTrigger className="w-36" aria-label="Filter by actor type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All actors</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                    <SelectItem value="guest">Guests</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <SearchableSelect
                  className="w-48"
                  contentClassName="min-w-[18rem]"
                  aria-label="Filter by user"
                  value={actorId}
                  onChange={withReset(setActorId)}
                  options={userSelectOptions}
                  disabled={actorKind !== ALL && actorKind !== "user"}
                  searchPlaceholder="Search by name or email..."
                  emptyText="No matching users"
                />
                {hasFilters && (
                  // Same "Reset filter" button as the Review Checklists page.
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="group ml-auto gap-1.5 overflow-hidden border bg-theme-bg-elevated hover:bg-destructive/5 hover:border-destructive/10"
                  >
                    Reset filter
                    <X className="h-4 w-0 -translate-x-1 text-destructive opacity-0 transition-all duration-200 ease-out group-hover:w-4 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ActivityTable
                items={data?.items ?? []}
                total={data?.total ?? 0}
                offset={offset}
                limit={limit}
                onRangeChange={({ offset: o, limit: l }) => {
                  setOffset(o);
                  setLimit(l);
                }}
                events={eventMap}
                emptyMessage={hasFilters ? "No activity matches these filters" : "No activity yet"}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
