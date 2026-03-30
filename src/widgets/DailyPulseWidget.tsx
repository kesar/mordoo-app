import { Text, VStack, HStack, Spacer } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding, background, cornerRadius } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type DailyPulseWidgetProps = {
  energyScore: number;
  luckyNumber: number;
  luckyColorName: string;
  luckyColorHex: string;
  insight: string;
  direction: string;
};

const DailyPulseWidget = (props: DailyPulseWidgetProps, env: WidgetEnvironment) => {
  'widget';

  if (env.widgetFamily === 'systemSmall') {
    return (
      <VStack spacing={4} modifiers={[padding({ all: 12 }), background('#0a0a14'), cornerRadius(16)]}>
        <Text modifiers={[font({ weight: 'bold', size: 11 }), foregroundStyle('#c9a84c')]}>
          หมอดู · PULSE
        </Text>
        <Text modifiers={[font({ weight: 'bold', size: 40 }), foregroundStyle('#f4e8c1')]}>
          {props.energyScore}
        </Text>
        <HStack spacing={6}>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(props.luckyColorHex)]}>
            ● {props.luckyColorName}
          </Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle('#f4e8c1')]}>
            {props.luckyNumber}
          </Text>
        </HStack>
        <Spacer />
        <Text modifiers={[font({ size: 10 }), foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
          {props.direction}
        </Text>
      </VStack>
    );
  }

  // systemMedium
  return (
    <HStack spacing={16} modifiers={[padding({ all: 14 }), background('#0a0a14'), cornerRadius(16)]}>
      <VStack spacing={4}>
        <Text modifiers={[font({ weight: 'bold', size: 11 }), foregroundStyle('#c9a84c')]}>
          หมอดู · PULSE
        </Text>
        <Text modifiers={[font({ weight: 'bold', size: 44 }), foregroundStyle('#f4e8c1')]}>
          {props.energyScore}
        </Text>
        <HStack spacing={6}>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(props.luckyColorHex)]}>
            ● {props.luckyColorName}
          </Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle('#f4e8c1')]}>
            {props.luckyNumber}
          </Text>
        </HStack>
      </VStack>
      <VStack spacing={6} alignment="leading">
        <Spacer />
        <Text modifiers={[font({ size: 13 }), foregroundStyle('#f4e8c1')]}>
          {props.insight}
        </Text>
        <Text modifiers={[font({ size: 11 }), foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
          ↗ {props.direction}
        </Text>
        <Spacer />
      </VStack>
    </HStack>
  );
};

export default createWidget('DailyPulseWidget', DailyPulseWidget);
