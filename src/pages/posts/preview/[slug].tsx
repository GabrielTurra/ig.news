import { useEffect } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/client";
import { useRouter } from "next/router";
import Head from "next/head";

import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../../services/prismic";

import { parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import styles from '../post.module.scss';
import Link from "next/link";

interface PostPreviewPops{
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

export default function PostPreview({ post }: PostPreviewPops){
    const [ session ] = useSession();
    const router = useRouter();

    useEffect(() => {
        if(session?.activeSubscription){
            router.push(`/posts/${post.slug}`)
        }
    }, [session])

    return(
        <>
            <Head>
                <title>{post.title} | ig.news</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div 
                        className={`${styles.postContent} ${styles.previewContent}`}
                        dangerouslySetInnerHTML={ { __html: post.content } } 
                    />

                    <div className={styles.continueReading}>
                        Wanna continue reading? 
                        <Link href="/"><a>Subscribe Now 🤗</a></Link>
                    </div>
                </article>
            </main>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { slug } = params;

    const prismic = getPrismicClient();
    const response = await prismic.getByUID('publication', String(slug), {});

    const post = {
        slug, 
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content.splice(0, 3)),
        updatedAt: format(
            parseISO(response.last_publication_date), 
            "dd 'de' MMMM 'de' yyyy", 
            { locale: pt }
        )
    }

    return {
        props: {
            post,
        },
        revalidate: 60 * 30, //30 minutes
    }
}