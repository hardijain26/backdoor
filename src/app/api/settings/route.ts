import { NextRequest, NextResponse } from 'next/server';
import {
  getSettingsWorkspace,
  updateNegativeFilterRules,
  updateDynamicTracks,
  saveByokSecretKey,
  updateMonitoredTwitterHandles,
  toggleSlackChannel,
  addSlackCommunityChannel,
  toggleAllAtsSources,
  addCustomAtsSource,
  removeCustomSource,
  integratePaidJobApi,
  updateInboundEmailAddress,
  updateMonitoredSubreddits,
  addCustomPlatformSource,
  addCommunityContributedApi,
} from '@/engine/settings';
import { toggleSourceEnabled } from '@/engine/fleet-health';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = getSettingsWorkspace();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.negativeFilters) {
      updateNegativeFilterRules(body.negativeFilters);
    }

    if (body.dynamicTracks) {
      updateDynamicTracks(body.dynamicTracks);
    }

    if (body.byokKey) {
      saveByokSecretKey(body.byokKey.id, body.byokKey.value);
    }

    if (body.sourceToggle) {
      toggleSourceEnabled(body.sourceToggle.sourceId, body.sourceToggle.enabled);
    }

    if (body.toggleAllAts !== undefined) {
      toggleAllAtsSources(Boolean(body.toggleAllAts.enabled));
    }

    if (body.twitterHandles) {
      updateMonitoredTwitterHandles(body.twitterHandles);
    }

    if (body.subreddits) {
      updateMonitoredSubreddits(body.subreddits);
    }

    if (body.inboundEmailAddress !== undefined) {
      updateInboundEmailAddress(body.inboundEmailAddress);
    }

    if (body.slackChannelToggle) {
      toggleSlackChannel(body.slackChannelToggle.channelId, body.slackChannelToggle.enabled);
    }

    if (body.addSlackChannel) {
      addSlackCommunityChannel(body.addSlackChannel);
    }

    if (body.addCustomAts) {
      addCustomAtsSource(body.addCustomAts);
    }

    if (body.addCustomPlatform) {
      addCustomPlatformSource(body.addCustomPlatform);
    }

    if (body.addMarketplaceApi) {
      addCommunityContributedApi(body.addMarketplaceApi);
    }

    if (body.removeCustomSource) {
      removeCustomSource(body.removeCustomSource.sourceId);
    }

    if (body.integratePaidJobApi) {
      integratePaidJobApi(
        body.integratePaidJobApi.apiId,
        body.integratePaidJobApi.apiKey,
        body.integratePaidJobApi.customEndpoint
      );
    }

    const updated = getSettingsWorkspace();
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}

