<script setup lang="ts">
  import { object, string, type InferType } from 'yup'
  import type { FormSubmitEvent } from '#ui/types'
  import type { User } from '@prisma/client';

  const user = useState<User>('user')
  const isLogged = useState<Boolean>('isLogged', () => false)
  const schema = object({
    username: string()
      .required('Required')
      .max(20, 'Must be at most 20 characters'),
    email: string()
      .email('Invalid email')
      .required('Required'),
    password: string()
      .min(8, 'Must be at least 8 characters')
      .required('Required')
  })

  type Schema = InferType<typeof schema>

  const state = reactive({
    username: undefined,
    email: undefined,
    password: undefined
  })

  async function onSubmit (event: FormSubmitEvent<Schema>) {
    // Do something with event.data
    console.log(event.data)
  }

  async function onSubmitDefault () {
    const defaultUser = await $fetch('/api/user-default')
    user.value = defaultUser
    console.log(defaultUser)
    isLogged.value = true
  }
  onMounted(async () => {
    const users = await $fetch('/api/users')

  })
</script>

<template>
  <div class="h-screen flex flex-col items-center justify-center">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
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
      <UButton 
        color="cyan"
        variant="link" 
        @click="onSubmitDefault"
      > 
        Create default user
      </UButton>
    </UForm>
  </div>
</template>