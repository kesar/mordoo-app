import React from 'react';
import { Text, View, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

interface MarkdownStyles {
  body?: TextStyle;
  strong?: TextStyle;
  em?: TextStyle;
  paragraph?: ViewStyle;
  bullet_list?: ViewStyle;
  ordered_list?: ViewStyle;
  list_item?: ViewStyle;
  heading1?: TextStyle;
  heading2?: TextStyle;
  heading3?: TextStyle;
}

interface Props {
  children: string;
  style?: MarkdownStyles;
}

// Inline: parse **bold** and *italic*
function renderInline(text: string, baseStyle?: TextStyle, styles?: MarkdownStyles) {
  const parts: React.ReactNode[] = [];
  // Match **bold** or *italic* (non-greedy)
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // **bold**
      parts.push(
        <Text key={match.index} style={[baseStyle, styles?.strong]}>
          {match[2]}
        </Text>,
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <Text key={match.index} style={[baseStyle, styles?.em]}>
          {match[3]}
        </Text>,
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

export function SimpleMarkdown({ children, style }: Props) {
  if (!children) return null;

  const lines = children.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line — skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      const headingStyle = style?.[`heading${level}` as keyof MarkdownStyles];
      elements.push(
        <Text key={i} style={[style?.body, headingStyle]}>
          {renderInline(headingMatch[2], style?.body, style)}
        </Text>,
      );
      i++;
      continue;
    }

    // Unordered list item
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      elements.push(
        <View key={i} style={[localStyles.listItem, style?.list_item]}>
          <Text style={[style?.body, localStyles.bullet]}>{'\u2022'}</Text>
          <Text style={[style?.body, localStyles.listText]}>
            {renderInline(bulletMatch[1], style?.body, style)}
          </Text>
        </View>,
      );
      i++;
      continue;
    }

    // Ordered list item
    const orderedMatch = line.match(/^(\d+)[.)]\s+(.+)/);
    if (orderedMatch) {
      elements.push(
        <View key={i} style={[localStyles.listItem, style?.list_item]}>
          <Text style={[style?.body, localStyles.bullet]}>{orderedMatch[1]}.</Text>
          <Text style={[style?.body, localStyles.listText]}>
            {renderInline(orderedMatch[2], style?.body, style)}
          </Text>
        </View>,
      );
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <Text key={i} style={[style?.body, style?.paragraph]}>
        {renderInline(line, style?.body, style)}
      </Text>,
    );
    i++;
  }

  return <View>{elements}</View>;
}

const localStyles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bullet: {
    width: 14,
    textAlign: 'center',
  },
  listText: {
    flex: 1,
  },
});
