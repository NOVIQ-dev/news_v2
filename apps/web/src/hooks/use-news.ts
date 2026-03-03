"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { newsApi, type NewsArticle } from "@/lib/api";
import {
  connectSocket,
  subscribeToNews,
  type NewsUpdate,
} from "@/lib/socket";

interface UseNewsParams {
  region?: string;
  tag?: string;
  search?: string;
  limit?: number;
}

export function useNews(params: UseNewsParams = {}) {
  const { region, tag, search, limit = 20 } = params;
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["news", { region, tag, search }],
    queryFn: ({ pageParam = 1 }) =>
      newsApi.getArticles({
        page: pageParam,
        limit,
        region,
        tag,
        search,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 60 * 1000,
  });

  const handleNewsUpdate = useCallback(
    (update: NewsUpdate) => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    [queryClient]
  );

  useEffect(() => {
    const socket = connectSocket();
    subscribeToNews();

    socket.on("news:update", handleNewsUpdate);

    return () => {
      socket.off("news:update", handleNewsUpdate);
    };
  }, [handleNewsUpdate]);

  const articles: NewsArticle[] =
    query.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    ...query,
    articles,
  };
}

export function useNewsSummary(articleId: string) {
  return {
    summarize: () => newsApi.summarize(articleId),
  };
}
