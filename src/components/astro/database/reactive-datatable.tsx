"use client";

import { HeaderSearchBar } from "@components/astro/common/header-search-bar.tsx";
import { ColCertificationPath } from "@components/astro/database/records-table/col-certification-path.tsx";
import { ColCertification } from "@components/astro/database/records-table/col-certification.tsx";
import { ColMoreDetails } from "@components/astro/database/records-table/col-more-details.tsx";
import {
    Pagination,
    PaginationGap,
    PaginationList,
    PaginationNext,
    PaginationPage,
    PaginationPrevious,
} from "@components/react/pagination.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/react/table.tsx";
import Fuse from "fuse.js";
import { all } from "radash";
import {
    type FC,
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";

import { FuseConfig } from "../../../pages/database/fuse.config.ts";
import type { CertificationMetadata, CertificationMetadataCollection } from "../../../types/certification-metadata.ts";

interface ReactiveDatatableProps {
    loading: ReactNode;
    /**
     * The base URL for the API without the trailing slash, defaults to `/database`
     */
    base_url?: string;
}

export const ReactiveDatatable: FC<ReactiveDatatableProps> = ({
    loading,
    base_url = "/database",
}) => {
    const [ is_loading, set_loading ] = useState(true);
    const [ error, set_error ] = useState<string | null>(null);
    const [ all_raw_data, set_all_raw_data ] =
              useState<CertificationMetadataCollection>([]);
    const [ all_data, set_all_data ] = useState<Fuse<CertificationMetadata>>(
        new Fuse([]),
    );
    const [ query, set_query ] = useState<string | null>(null);
    const [ pagination, set_pagination ] = useState({
        page:        1,
        total_pages: 1,
        per_page:    10,
    });
    const [ url_search_params, set_url_search_params ] = useState<URLSearchParams>();
    const pagination_url = useMemo(() => {
        if (!url_search_params) {
            return {
                previous:           null,
                previous_long_step: "#",
                first:              "#",
                second:             "#",
                next:               null,
                next_long_step:     "#",
                last:               "#",
                last_but_one:       "#",
            };
        }

        return {
            previous:           (() => {
                const tmp = new URLSearchParams(url_search_params);
                tmp.set("page", `${ pagination.page - 1 }`);

                return pagination.page > 1 ? `${ base_url }/?${ tmp.toString() }` : null;
            })(),
            previous_long_step: (() => {
                const tmp = new URLSearchParams(url_search_params);
                tmp.set("page", `${ pagination.page - 2 }`);

                return pagination.page > 2 ? `${ base_url }/?${ tmp.toString() }` : "#";
            })(),
            first:              (() => {
                const tmp = new URLSearchParams(url_search_params);
                tmp.set("page", "1");

                return `${ base_url }/?${ tmp.toString() }`;
            })(),
            second:             (() => {
                const tmp = new URLSearchParams(url_search_params);
                tmp.set("page", "2");

                return `${ base_url }/?${ tmp.toString() }`;
            })(),
            next:               (() => {
                const tmp = new URLSearchParams(url_search_params);
                tmp.set("page", `${ pagination.page + 1 }`);

                return pagination.page < pagination.total_pages ? `${ base_url }/?${ tmp.toString() }` : null;
            })(),
            next_long_step:     (() => {
                const tmp = new URLSearchParams(url_search_params);
                tmp.set("page", `${ pagination.page + 2 }`);

                return pagination.page < pagination.total_pages - 1 ? `${ base_url }/?${ tmp.toString() }` : "#";
            })(),
            last:               (() => {
                const tmp = new URLSearchParams(url_search_params);
                tmp.set("page", `${ pagination.total_pages }`);

                return `${ base_url }/?${ tmp.toString() }`;
            })(),
            last_but_one:       (() => {
                const tmp = new URLSearchParams(url_search_params);
                tmp.set("page", `${ pagination.total_pages - 1 }`);

                return `${ base_url }/?${ tmp.toString() }`;
            })(),
        };
    }, [
        url_search_params,
        pagination.page,
        base_url,
        pagination.total_pages,
    ]);
    const display_data = useMemo(
        () => {
            if (query) {
                const filtered_data = all_data.search(query).flatMap((result) => result.item);
                set_pagination((prev) => ({
                    ...prev,
                    total_pages: Math.ceil(filtered_data.length / pagination.per_page),
                }));
                return filtered_data;
            }
            return all_raw_data;
        },
        [
            all_data,
            query,
            all_raw_data,
            pagination.per_page,
        ],
    );

    useEffect(() => {
        set_loading(true);

        // load data from the URL
        const search_params = new URLSearchParams(window.location.search);
        set_url_search_params(search_params);

        // Get the page number from the URL
        const page = search_params.get("page");
        if (page && !Number.isNaN(+page)) {
            set_pagination((prev) => ({
                ...prev,
                page: +page,
            }));
        }

        const query = search_params.get("query");
        if (query) {
            set_query(query);
        }

        // Fetch data from the server
        all({
            data:  fetch(`${ base_url }/data.json`),
            index: fetch(`${ base_url }/data-index.json`),
        }).then(async ({
                data,
                index,
            }) => {
                if (!data.ok || !index.ok) {
                    set_error(
                        "An unexpected error occurred, try again in a few minutes.",
                    );
                    return;
                }

                const all_data: CertificationMetadataCollection = await data.json();
                const total_pages = Math.ceil(all_data.length / pagination.per_page);

                // store the raw data as an empty filter is not allowed in fuse.js
                set_all_raw_data(all_data);

                // If the page number is greater than the total number of pages
                // then set the page number to 1
                if (page && +page > total_pages) {
                    set_url_search_params((prev) => {
                        let tmp;
                        if (!prev) {
                            tmp = new URLSearchParams(window.location.search);
                        }
                        else {
                            tmp = new URLSearchParams(prev);
                        }

                        tmp.set("page", "1");
                        return tmp;
                    });
                    set_pagination((prev) => ({
                        ...prev,
                        page: 1,
                        total_pages,
                    }));
                }
                else {
                    // Set the total number of pages keeping the page number the same
                    set_pagination((prev) => ({
                        ...prev,
                        total_pages,
                    }));
                }

                // we have the pre-computed index, so we can just load it into fuse and enjoy the speed
                const parsed_index = Fuse.parseIndex<CertificationMetadata>(await index.json());

                set_all_data(
                    new Fuse(
                        all_data,
                        FuseConfig,
                        parsed_index,
                    ),
                );
            })
            .catch((e) => {
                console.error(e);
                set_error("An unexpected error occurred, try again in a few minutes.");
            })
            .finally(() => {
                set_loading(false);
            });
    }, []);

    return (
        <>
            <div className="grid grid-cols-2 mb-2 mt-4">
                <HeaderSearchBar value={ query }
                                 onInput={ (ev) => set_query((ev as unknown as InputEvent).data) }
                                 base_url={ base_url }
                />
            </div>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeader>Certification</TableHeader>
                        <TableHeader className="hidden sm:table-cell">Certification paths</TableHeader>
                        <TableHeader className="hidden sm:table-cell text-right">More details</TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    { is_loading && (
                        <TableRow>
                            <TableCell colSpan={ 3 }
                                       className="py-5 px-6 text-center"
                            >
                                { loading }
                            </TableCell>
                        </TableRow>
                    ) }
                    { error && (
                        <TableRow>
                            <TableCell colSpan={ 3 }
                                       className="py-5 px-6 text-center"
                            >
                                <p className="text-red-500 font-medium">
                                    { error }
                                </p>
                            </TableCell>
                        </TableRow>
                    ) }
                    { !is_loading && !error && display_data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={ 3 }
                                       className="py-5 px-6 text-center"
                            >
                                <p className="text-zinc-500 font-medium">
                                    No results found
                                </p>
                            </TableCell>
                        </TableRow>
                    ) }
                    { display_data
                        .slice(
                            (pagination.page - 1) * pagination.per_page,
                            pagination.page * pagination.per_page,
                        )
                        .map((certification) => (
                            <TableRow
                                key={ `${ certification.provider }-${ certification.title }` }
                            >
                                <TableCell className="font-medium relative py-5 px-6 max-w-full">
                                    <ColCertification { ...certification } />
                                </TableCell>
                                <TableCell className="hidden py-5 px-6 sm:table-cell">
                                    <ColCertificationPath { ...certification } />
                                </TableCell>
                                <TableCell className="hidden sm:table-cell py-5 px-6 text-right">
                                    <ColMoreDetails { ...certification } />
                                </TableCell>
                            </TableRow>
                        )) }
                </TableBody>
                <tfoot>
                    <TableRow>
                        <TableCell colSpan={ 3 }>
                            <p className="sm:ml-auto text-xs text-zinc-700 sm:text-right max-w-full">
                                Showing { (pagination.page - 1) * pagination.per_page } - { " " }
                                { Math.min(pagination.page * pagination.per_page, display_data.length) } of { " " }
                                { display_data.length } results
                            </p>
                        </TableCell>
                    </TableRow>
                </tfoot>
            </Table>
            <Pagination className="mt-6 justify-end">
                <PaginationPrevious href={ pagination_url.previous } />
                <PaginationList>
                    { Array.from({ length: pagination.page - 1 }).length > 2 ? (
                        <>
                            <PaginationPage href={ pagination_url.first }>1</PaginationPage>
                            <PaginationPage href={ pagination_url.second }>2</PaginationPage>
                            { pagination.page - 2 !== 2 && (
                                <PaginationGap />
                            ) }
                            { pagination.page > 1 && (
                                <PaginationPage href={ pagination_url.previous || "#" }>
                                    { pagination.page - 1 }
                                </PaginationPage>
                            ) }
                        </>
                    ) : (
                          <>
                              { pagination.page > 2 && (
                                  <PaginationPage href={ pagination_url.previous_long_step }>
                                      { pagination.page - 2 }
                                  </PaginationPage>
                              ) }
                              { pagination.page > 1 && (
                                  <PaginationPage href={ pagination_url.previous || "#" }>
                                      { pagination.page - 1 }
                                  </PaginationPage>
                              ) }
                          </>
                      ) }
                    <PaginationPage href={ "#" }
                                    current
                    >
                        { pagination.page }
                    </PaginationPage>
                    { Array.from({
                        length: pagination.total_pages - (pagination.page - 1),
                    }).length > 3 ? (
                          <>
                              { pagination.page < pagination.total_pages - 1 && (
                                  <PaginationPage href={ pagination_url.next || "#" }>
                                      { pagination.page + 1 }
                                  </PaginationPage>
                              ) }
                              { pagination.page + 2 !== pagination.total_pages - 1 && (
                                  <PaginationGap />
                              ) }
                              { pagination.page + 1 !== pagination.total_pages - 1 && (
                                  <PaginationPage href={ pagination_url.last_but_one }>
                                      { pagination.total_pages - 1 }
                                  </PaginationPage>
                              ) }
                              <PaginationPage
                                  href={ pagination_url.last }
                              >
                                  { pagination.total_pages }
                              </PaginationPage>
                          </>
                      ) : (
                          <>
                              { pagination.page < pagination.total_pages && (
                                  <PaginationPage href={ pagination_url.next || "#" }>
                                      { pagination.page + 1 }
                                  </PaginationPage>
                              ) }
                              { pagination.page < pagination.total_pages - 1 && (
                                  <PaginationPage href={ pagination_url.next_long_step }>
                                      { pagination.page + 2 }
                                  </PaginationPage>
                              ) }
                          </>
                      ) }
                </PaginationList>
                <PaginationNext href={ pagination_url.next } />
            </Pagination>
        </>
    );
};
