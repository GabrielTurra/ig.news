import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

import { signIn, signOut, useSession } from 'next-auth/client'

import styles from './styles.module.scss';

export function SignInButton(){
    const [ session ] = useSession();

    return session ? (
        <button 
            className={styles.SignInButton} 
            type="button"
            onClick={() => signOut()}
        >
            <FaGithub color="#04d361"/>
            {session.user.name}
            <FiX className={styles.closeIcon} color="#737380"/>
        </button>
    ) : (
        <button
            className={styles.SignInButton}
            type="button"
            onClick={() => signIn('github')}
        >
            <FaGithub color="#eba417"/>
            Sign In with Github
        </button>
    )
}