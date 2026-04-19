'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import type { CardType } from '@/types/card';

interface CardPreviewProps {
  content: string;
  cardType: CardType;
  /** 問題面(front)を表示しているかどうか。clozeタイプの穴埋め変換に使用 */
  isFront?: boolean;
}

/**
 * Markdownコンテンツをレンダリングするプレビューコンポーネント。
 * clozeタイプの問題面では {{word}} を [___] に変換する。
 */
export default function CardPreview({ content, cardType, isFront = false }: CardPreviewProps) {
  // clozeタイプの問題面では穴埋め表示に変換
  const displayContent =
    cardType === 'cloze' && isFront
      ? content.replace(/\{\{(.+?)\}\}/g, '[___]')
      : content;

  if (!displayContent) {
    return (
      <div className="text-gray-400 text-sm italic p-3">
        プレビューがここに表示されます
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none p-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}
