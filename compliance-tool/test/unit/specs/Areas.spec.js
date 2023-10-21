import { shallowMount } from '@vue/test-utils'
import Areas from '@/views/Admin/Areas.vue'
import { createLocalVue } from '../setup'


describe('Areas.vue', () => {

  const localVue = createLocalVue()

  test('TheHeader.vue edit items', () => {

    const wrapper = shallowMount(Areas, {
      localVue,
      stubs: ['datatable', 'datatable-column']
    })

    wrapper.setData({
      areas: [
        { id: 1, name: "area 1", sectionId: 1 },
        { id: 2, name: "area 2", sectionId: 2 },
        { id: 3, name: "area 3", sectionId: 2 }
      ],
    });

    wrapper.vm.onItemEdit('name', 'new area 1', 1)
    expect(wrapper.vm.editedAreas.length).toBe(1)
    expect(wrapper.vm.editedAreas[0].name).toBe('new area 1')

    wrapper.vm.onItemEdit('sectionId', 3, 2)
    expect(wrapper.vm.editedAreas.length).toBe(2)
    expect(wrapper.vm.editedAreas[1].sectionId).toBe(3)
  })

})