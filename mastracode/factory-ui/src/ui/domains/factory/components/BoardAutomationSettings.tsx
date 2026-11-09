import { Field, FieldContent, FieldDescription, FieldLabel } from '@mastra/playground-ui/components/Field';
import { Popover, PopoverContent, PopoverTrigger } from '@mastra/playground-ui/components/Popover';
import { Switch } from '@mastra/playground-ui/components/Switch';
import { toast } from '@mastra/playground-ui/components/Toaster';
import { Txt } from '@mastra/playground-ui/components/Txt';
import { Settings2 } from 'lucide-react';
import { Link } from 'react-router';

import { useSetReviewTestChecksMutation } from '../../../../hooks/useFactoryAutomation';
import { settingsSectionPath } from '../../settings/settingsSections';

export function BoardAutomationSettings({
  factoryProjectId,
  reviewTestChecksEnabled,
}: {
  factoryProjectId: string;
  reviewTestChecksEnabled: boolean;
}) {
  const testChecks = useSetReviewTestChecksMutation(factoryProjectId);

  return (
    <Popover>
      <PopoverTrigger variant="default" size="icon-sm" aria-label="Automation settings" tooltip="Automation settings">
        <Settings2 aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)]" aria-label="Automation settings">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <Txt as="h2" variant="subheading">
              Automation
            </Txt>
            <Txt variant="caption" tone="muted">
              All boards in this factory.
            </Txt>
          </div>
          <Txt variant="caption" tone="muted">
            The board&apos;s phases decide which runs start on their own and whether cards get a self-review.{' '}
            <Link to={settingsSectionPath(factoryProjectId, 'board')} className="underline underline-offset-2">
              Edit the Work board
            </Link>
          </Txt>
          <Field orientation="horizontal" className="items-start gap-4">
            <FieldContent>
              <FieldLabel>Publish review test checks</FieldLabel>
              <FieldDescription>Report review test results as a check on the pull request.</FieldDescription>
            </FieldContent>
            <Switch
              aria-label="Publish review test checks"
              checked={reviewTestChecksEnabled}
              disabled={testChecks.isPending}
              onCheckedChange={next => testChecks.mutate(next, { onError: error => toast.error(error.message) })}
            />
          </Field>
        </div>
      </PopoverContent>
    </Popover>
  );
}
