SELECT
  DISTINCT `d`.`idDisciplina` AS `idDisciplina`,
  `d`.`nomeDisciplina` AS `nomeDisciplina`,
  `d`.`codigoDisciplina` AS `codigoDisciplina`,
  `cd`.`periodo` AS `periodo`,
  `c`.`idCurso` AS `idCurso`,
  `c`.`nomeCurso` AS `nomeCurso`
FROM
  (
    (
      `grade_horario_apresentacao`.`disciplina` `d`
      JOIN `grade_horario_apresentacao`.`curso_disciplina` `cd` ON((`d`.`idDisciplina` = `cd`.`idDisciplina`))
    )
    JOIN `grade_horario_apresentacao`.`curso` `c` ON((`cd`.`idCurso` = `c`.`idCurso`))
  )