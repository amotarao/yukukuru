import * as functions from 'firebase-functions';

export type HttpsOnCallHandler = Parameters<InstanceType<typeof functions.FunctionBuilder>['https']['onCall']>[0];

type UserBuilder = InstanceType<typeof functions.auth.UserBuilder>;
export type AuthOnCreateHandler = Parameters<UserBuilder['onCreate']>[0];
export type AuthOnDeleteHandler = Parameters<UserBuilder['onDelete']>[0];

type DocumentBuilder = InstanceType<typeof functions.firestore.DocumentBuilder>;
export type FirestoreOnCreateHandler = Parameters<DocumentBuilder['onCreate']>[0];
export type FirestoreOnUpdateHandler = Parameters<DocumentBuilder['onUpdate']>[0];

export type PubSubOnRunHandler = Parameters<InstanceType<typeof functions.pubsub.ScheduleBuilder>['onRun']>[0];
export type PubSubOnPublishHandler = Parameters<InstanceType<typeof functions.pubsub.TopicBuilder>['onPublish']>[0];
