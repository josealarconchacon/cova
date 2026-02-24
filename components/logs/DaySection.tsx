import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation } from "react-native";
import { TimelineItem } from "./TimelineItem";
import { daySectionStyles } from "../../app/(tabs)/index.styles";
import type { Log } from "../../types";
import type { DayGroup } from "../../lib/home/dateUtils";

interface DaySectionProps {
  day: DayGroup;
  defaultExpanded: boolean;
  swipeOpenId: string | null;
  onSwipeOpen: (id: string) => void;
  onSwipeClose: () => void;
  onEdit: (log: Log) => void;
  onDelete: (id: string) => void;
}

export function DaySection({
  day,
  defaultExpanded,
  swipeOpenId,
  onSwipeOpen,
  onSwipeClose,
  onEdit,
  onDelete,
}: DaySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View style={daySectionStyles.container}>
      <TouchableOpacity
        style={daySectionStyles.header}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <View style={daySectionStyles.headerLeft}>
          <Text style={daySectionStyles.chevron}>{expanded ? "▼" : "▶"}</Text>
          <Text style={daySectionStyles.title}>{day.label}</Text>
        </View>
        <View style={daySectionStyles.badge}>
          <Text style={daySectionStyles.badgeText}>
            {day.logs.length} {day.logs.length === 1 ? "entry" : "entries"}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={daySectionStyles.body}>
          {day.logs.map((log, i) => (
            <TimelineItem
              key={log.id}
              log={log}
              index={i}
              isSwipeOpen={swipeOpenId === log.id}
              onSwipeOpen={() => onSwipeOpen(log.id)}
              onSwipeClose={onSwipeClose}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </View>
      )}
    </View>
  );
}
