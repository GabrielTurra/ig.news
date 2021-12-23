import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { Session } from "next-auth";
import Head from "next/head";

import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../services/prismic";

import { parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import styles from './post.module.scss';

interface PostPops{
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

interface SessionProps extends Session{
    activeSubscription: null | object;
}

export default function Post({ post }: PostPops){
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
                        className={styles.postContent}
                        dangerouslySetInnerHTML={ { __html: post.content } } 
                    />
                </article>
            </main>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    const session = await getSession({ req }) as SessionProps;
    const { slug } = params;

    console.log(session)
    
    if(!session?.activeSubscription) {
        return { 
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const prismic = getPrismicClient(req);
    const response = await prismic.getByUID('publication', String(slug), {});

    const post = {
        slug, 
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAt: format(
            parseISO(response.last_publication_date), 
            "dd 'de' MMMM 'de' yyyy", 
            { locale: pt }
        )
    }

    return {
        props: {
            post,
        }
    }
}