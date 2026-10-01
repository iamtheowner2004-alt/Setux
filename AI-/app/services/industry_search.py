import concurrent.futures
from ddgs import DDGS

_search_executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)


def _single_ddgs_search(query: str, max_results: int = 4):
    results = []
    try:
        with DDGS(timeout=6) as ddgs:
            for r in ddgs.text(query, max_results=max_results):
                url = r.get("href")
                if url:
                    results.append({
                        "query": query,
                        "title": r.get("title", ""),
                        "url": url,
                        "description": r.get("body", "")
                    })
    except Exception as e:
        print(f"DDGS query notice for '{query}': {e}")
    return results


def search_industries(
    queries: list[str],
    max_results_per_query: int = 4
):
    all_results = []
    seen_urls = set()

    queries_to_run = queries[:2] if queries else ["sustainable technology companies India"]

    try:
        futures = [_search_executor.submit(_single_ddgs_search, q, max_results_per_query) for q in queries_to_run]
        for f in futures:
            try:
                query_results = f.result(timeout=7.0)
                for res in query_results:
                    if res["url"] not in seen_urls:
                        seen_urls.add(res["url"])
                        all_results.append(res)
            except Exception as e:
                print(f"DDGS timeout/error notice: {e}")
    except Exception as error:
        print(f"INDUSTRY SEARCH NOTICE: {error}")

    return all_results