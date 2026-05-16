import type { Metadata } from "next";
import { Noto_Sans_JP, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const notoSansJP = Noto_Sans_JP({ subsets: ["latin"] });
const zenMaruGothic = Zen_Maru_Gothic({ 
  weight: ["500", "700", "900"], 
  subsets: ["latin"], 
  variable: '--font-zen-maru' 
});

export const metadata: Metadata = {
  title: "GitHub行数チェッカー",
  description: "GitHubの公開リポジトリからコード行数を算出します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.className} ${zenMaruGothic.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
