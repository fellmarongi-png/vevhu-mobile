import { forwardRef, useImperativeHandle } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ScrollView, StyleSheet, View } from "react-native";
import type { FormField as FormFieldType, FormSchema, TalkingScript } from "../../types/form";
import { FormField } from "./FormField";
import { ScriptBox } from "./ScriptBox";

interface DynamicFormProps {
  schema: FormSchema;
  onSubmit: (data: Record<string, unknown>) => void;
  defaultValues?: Record<string, unknown>;
}

export interface DynamicFormRef {
  submit: () => void;
  reset: () => void;
}

export const DynamicForm = forwardRef<DynamicFormRef, DynamicFormProps>(function DynamicForm(
  { schema, onSubmit, defaultValues },
  ref,
) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {},
  });

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onSubmit)(),
    reset: () => reset(defaultValues || {}),
  }));

  const watchedValues = useWatch({ control });

  const isFieldVisible = (field: FormFieldType): boolean => {
    if (!field.condition) return true;
    const depValue = watchedValues[field.condition.field];
    return depValue === field.condition.value;
  };

  const getActiveScript = (): TalkingScript | null => {
    const visibleScripts = schema.scripts.filter((script) => {
      if (!script.condition) return true;
      const depValue = watchedValues[script.condition.field];
      return depValue === script.condition.value;
    });
    return visibleScripts[visibleScripts.length - 1] || schema.scripts[0] || null;
  };

  const sortedFields = [...schema.fields].sort((a, b) => a.order - b.order);
  const activeScript = getActiveScript();

  return (
    <View style={styles.container}>
      {activeScript && <ScriptBox script={activeScript} />}

      {sortedFields.map((field) => {
        if (!isFieldVisible(field)) return null;

        const scriptForSection = schema.scripts.find(
          (s) =>
            s.section === field.section &&
            s.condition &&
            watchedValues[s.condition.field] === s.condition.value,
        );

        return (
          <View key={field.id}>
            {scriptForSection &&
              field.order ===
                sortedFields.find((f) => f.section === field.section && isFieldVisible(f))
                  ?.order && <ScriptBox script={scriptForSection} />}
            <Controller
              control={control}
              name={field.id}
              rules={{ required: field.required ? `${field.label} is required` : false }}
              render={({ field: controllerField }) => (
                <FormField
                  fieldDef={field}
                  value={controllerField.value}
                  onChange={controllerField.onChange}
                  error={errors[field.id]?.message as string | undefined}
                />
              )}
            />
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
