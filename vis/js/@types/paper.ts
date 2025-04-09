export interface Paper {
    id: string;
    safe_id: string;
    oa_link: string;
    link: string;
    identifier: string;
    relation: string;
    outlink: string;
    fulltext: string;
    list_link: any;

    title: string;
    authors_objects: {
        firstName: string;
        lastName: string;
    }[]
    year: string;
    source: string;
    volume: number;
    issue: number;
    page: number;
    issn: number;

    resulttype: string[];

    x?: number;
    y?: number;

    width?: number;
    height?: number;

    area_uri: string;
    area: string;

    free_access: boolean;
    oa: boolean;

    // data from backend
    cited_by_fbwalls_count?: number;
    cited_by_feeds_count?: number;
    cited_by_gplus_count?: number;
    cited_by_rdts_count?: number;
    cited_by_qna_count?: number;
    cited_by_tweeters_count?: number;
    cited_by_videos_count?: number;

    // data manager
    // calculated values
    social?: string | number;
}