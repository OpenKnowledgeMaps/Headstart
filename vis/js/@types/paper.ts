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

    resulttype: string;

    x?: number;
    y?: number;

    width?: number;
    height?: number;

    area_uri: string;
    area: string;
}