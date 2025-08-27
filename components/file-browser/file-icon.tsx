import {
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  CodeBracketIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"

interface FileIconProps {
  fileName: string
  className?: string
}

export function FileIcon({ fileName, className = "h-5 w-5" }: FileIconProps) {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""

  const getIconByExtension = () => {
    // Images
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(extension)) {
      return <PhotoIcon className={`${className} text-green-600`} />
    }

    // Videos
    if (["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"].includes(extension)) {
      return <FilmIcon className={`${className} text-purple-600`} />
    }

    // Audio
    if (["mp3", "wav", "flac", "aac", "ogg", "wma"].includes(extension)) {
      return <MusicalNoteIcon className={`${className} text-pink-600`} />
    }

    // Archives
    if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension)) {
      return <ArchiveBoxIcon className={`${className} text-orange-600`} />
    }

    // Code files
    if (
      [
        "js",
        "ts",
        "jsx",
        "tsx",
        "html",
        "css",
        "scss",
        "json",
        "xml",
        "yaml",
        "yml",
        "py",
        "java",
        "cpp",
        "c",
        "php",
        "rb",
        "go",
        "rs",
      ].includes(extension)
    ) {
      return <CodeBracketIcon className={`${className} text-blue-600`} />
    }

    // Text files
    if (["txt", "md", "rtf", "csv"].includes(extension)) {
      return <DocumentTextIcon className={`${className} text-gray-600`} />
    }

    // Default document icon
    return <DocumentIcon className={`${className} text-gray-500`} />
  }

  return getIconByExtension()
}
