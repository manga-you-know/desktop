<script setup lang="ts">
import { type InferType, object, string } from 'yup';
import { UserDB } from '~/database';
import type { User } from '~/models';
import type { FormSubmitEvent } from '#ui/types';

const user = useState<User>('user');
const isLogged = useState<boolean>('isLogged', () => false);
const schema = object({
  username: string()
    .required('Required')
    .max(20, 'Must be at most 20 characters'),
  email: string().email('Invalid email').required('Required'),
  password: string()
    .min(8, 'Must be at least 8 characters')
    .required('Required'),
});
const isThereUsers = ref(false);
const users = ref<User[]>([]);

type Schema = InferType<typeof schema>;

const state = reactive({
  username: undefined,
  email: undefined,
  password: undefined,
});

onMounted(async () => {
  const defaultuser = await UserDB.getDefaultUser();
  user.value = defaultuser;
  isLogged.value = true;
  return;
  // const usersH = await UserDB.getUsers();
  // console.log(usersH);
  // if (usersH.length > 0) {
  //   users.value = usersH;
  //   isThereUsers.value = true;
  // }
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with event.data
  console.log(event.data);
}

function selectUser(userOut: User) {
  console.log(userOut);
  user.value = userOut;
  isLogged.value = true;
}

async function onSubmitDefault() {
  const defaultuser = await UserDB.getDefaultUser();
  user.value = defaultuser;
  isLogged.value = true;
}
</script>

<template>
  <div v-if="isThereUsers" class="h-screen flex flex-col items-center justify-center">
    <div class="flex flex-row">
      <div v-for="user in users" :key="user.id">
        <img :src="user.icon" width="300" height="400" draggable="false">
        <UBadge class="m-1" color="white" variant="solid" >
          {{ user.username}}
        </UBadge>
        <UButton @click="selectUser(user)" color="cyan" variant="link">
          Login
        </UButton>
        <UButton color="cyan" variant="link" @click="isThereUsers = false">
          create a new account
        </UButton>
      </div>
    </div>
  </div>
  <div v-else class="h-screen flex flex-col items-center justify-center">
    <UForm :schema="schema" :state="state" class="gap-4" @submit="onSubmit">
      <UInput color="cyan" disabled v-model="state.username" />
      <UInput color="cyan" disabled v-model="state.email" />
      <UInput color="cyan" disabled v-model="state.password" type="password" />
      <UButton 
        color="cyan"
        disabled 
        type="submit"
      >
        Submit
      </UButton>
      <UButton color="cyan" variant="link" @click="onSubmitDefault"> 
        Use default local account
      </UButton>
    </UForm>
  </div>
</template>
