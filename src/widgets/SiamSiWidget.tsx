import { Text, VStack, HStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding, background, cornerRadius } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type SiamSiWidgetProps = {
  stickNumber: number;
  title: string;
  fortune: string;
  fortuneColor: string;
};

const FORTUNE_SYMBOLS: Record<string, string> = {
  excellent: '✦',
  good: '◆',
  fair: '○',
  caution: '△',
};

const SiamSiWidget = (props: SiamSiWidgetProps, env: WidgetEnvironment) => {
  'widget';

  const symbol = FORTUNE_SYMBOLS[props.fortune] ?? '○';

  if (env.widgetFamily === 'accessoryRectangular') {
    return (
      <VStack spacing={2} alignment="leading">
        <HStack spacing={4}>
          <Text modifiers={[font({ weight: 'bold', size: 12 }), foregroundStyle('#c9a84c')]}>
            เซียมซี
          </Text>
          <Text modifiers={[font({ size: 12 })]}>
            #{props.stickNumber}
          </Text>
        </HStack>
        <Text modifiers={[font({ size: 11 })]}>
          {props.title}
        </Text>
      </VStack>
    );
  }

  // systemSmall
  return (
    <VStack spacing={6} modifiers={[padding({ all: 12 }), background('#0a0a14'), cornerRadius(16)]}>
      <Text modifiers={[font({ weight: 'bold', size: 11 }), foregroundStyle('#c9a84c')]}>
        หมอดู · เซียมซี
      </Text>
      <Text modifiers={[font({ weight: 'bold', size: 32 }), foregroundStyle('#f4e8c1')]}>
        {symbol} {props.stickNumber}
      </Text>
      <Text modifiers={[font({ weight: 'semibold', size: 13 }), foregroundStyle('#f4e8c1')]}>
        {props.title}
      </Text>
      <Text modifiers={[font({ size: 11 }), foregroundStyle(props.fortuneColor)]}>
        {props.fortune}
      </Text>
    </VStack>
  );
};

export default createWidget('SiamSiWidget', SiamSiWidget);
