import { css } from '@emotion/css';
import Link from "next/link";


export default function Home() {
  return (
    <div className={css`
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-size: 2.5rem;
              gap: 3rem;
              a{
                text-decoration: none;
                color: inherit;
                font-variant: small-caps;
                font-weight: bold;
                transition: filter .3s;
                &:hover{
                  filter: contrast(.9) drop-shadow(0 -.5rem 1.5rem #d3d3d3);
                }
              }
  `}>
      <p><Link href="/admin">admin</Link></p>
      <p><Link href="/agent">agent</Link></p>
    </div>
  )
}

