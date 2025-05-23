import * as yup from "yup";

export const StudioSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  aliases: yup.array().of(yup.string().trim().ensure()).ensure().default([]),
  urls: yup
    .array()
    .of(
      yup.object({
        url: yup.string().url("Invalid URL").required(),
        site: yup
          .object({
            id: yup.string().required(),
            name: yup.string().required(),
            icon: yup.string().required(),
          })
          .required(),
      }),
    )
    .ensure(),
  images: yup
    .array()
    .of(
      yup.object({
        id: yup.string().required(),
        url: yup.string().required(),
        width: yup.number().required(),
        height: yup.number().required(),
      }),
    )
    .required(),
  parent: yup
    .object({
      id: yup.string().required(),
      name: yup.string().required(),
    })
    .nullable()
    .default(null),
  note: yup.string().required("Edit note is required"),
});

export type StudioFormData = yup.Asserts<typeof StudioSchema>;
